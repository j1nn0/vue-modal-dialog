import process from 'node:process';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const stdin = readStdin();
const workspaceRoot = detectWorkspaceRoot(stdin);

if (!workspaceRoot) {
  emitMessage('Quality gate skipped: workspace root could not be resolved.');
  process.exit(0);
}

const changedFiles = getChangedFiles(workspaceRoot);

if (changedFiles.length === 0) {
  emitMessage('Quality gate skipped: no changed files detected.');
  process.exit(0);
}

if (!hasRelevantChanges(changedFiles)) {
  emitMessage('Quality gate skipped: no relevant source or config changes detected.');
  process.exit(0);
}

const validation = spawnSync('pnpm format && pnpm lint && pnpm test', {
  cwd: workspaceRoot,
  encoding: 'utf8',
  shell: true,
});

if (validation.status === 0) {
  emitMessage('Quality gate passed: pnpm format && pnpm lint && pnpm test completed successfully.');
  process.exit(0);
}

const output = [validation.stdout, validation.stderr].filter(Boolean).join('\n').trim();
emitMessage(`Quality gate failed: pnpm format && pnpm lint && pnpm test\n${truncate(output)}`);
process.exit(2);

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function detectWorkspaceRoot(raw) {
  const parsed = parseJson(raw);

  const directCandidates = [
    parsed?.workspaceRoot,
    parsed?.cwd,
    parsed?.workspace?.root,
    parsed?.workspace?.cwd,
    parsed?.hookInput?.workspaceRoot,
    parsed?.hookInput?.cwd,
  ].filter(Boolean);

  if (directCandidates.length > 0) {
    return directCandidates[0];
  }

  const workspaces = parsed?.workspaces;
  if (Array.isArray(workspaces) && workspaces.length > 0) {
    const first = workspaces[0];
    if (typeof first === 'string') return first;
    if (first?.root) return first.root;
    if (first?.cwd) return first.cwd;
    if (first?.uri?.fsPath) return first.uri.fsPath;
  }

  return process.cwd();
}

function parseJson(raw) {
  if (!raw || !raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getChangedFiles(cwd) {
  const result = spawnSync('git', ['status', '--short'], {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0 || !result.stdout) {
    return [];
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[ MARCUD?!]{1,2}\s+/, ''));
}

function hasRelevantChanges(files) {
  return files.some((file) => {
    return (
      file.startsWith('src/') ||
      file.startsWith('types/') ||
      file === 'package.json' ||
      file === 'pnpm-lock.yaml' ||
      file === 'vite.config.js' ||
      file === 'vitest.config.js' ||
      file === 'eslint.config.js'
    );
  });
}

function truncate(text) {
  if (text.length <= 4000) {
    return text;
  }

  return `${text.slice(0, 4000)}\n...output truncated...`;
}

function emitMessage(message) {
  process.stdout.write(
    JSON.stringify({
      continue: true,
      systemMessage: message,
    }),
  );
}
