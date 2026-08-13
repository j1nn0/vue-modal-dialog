// Development-environment guard, run from the `prepare` script.
//
// This used to be `engines` + `engine-strict=true`, but `engines` is published
// and consumers were being told they need Node 24 to use a browser component
// library that touches no Node API. `engines` now states the real consumer
// floor, and this file carries the development requirement instead.
//
// `devEngines` would be the purpose-built field, but pnpm 10.34 does not
// enforce it: an impossible `>=99` requirement with `onFail: "error"` installs
// and runs scripts without so much as a warning. So the check lives here.
//
// `prepare` runs for this repo and for git/directory installs, never for a
// registry tarball, so consumers never execute this. `scripts/` is outside
// `files` and is not published either.

const NODE_MAJOR = 24; // matches .github/workflows/*.yml
const PNPM_MAJOR = 10; // matches the packageManager pin

// The hard floor is Node 22 — vite.config.ts uses import attributes
// (`with { type: 'json' }`). We require what CI actually tests instead, since
// this is a development-only constraint and being strict here costs nothing.

const problems = [];

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < NODE_MAJOR) {
  problems.push(
    `Node >= ${NODE_MAJOR} is required for development (CI runs ${NODE_MAJOR}); found ${process.version}.`,
  );
}

// npm_config_user_agent looks like "pnpm/10.34.4 npm/? node/v24.19.0 linux x64".
const userAgent = process.env.npm_config_user_agent ?? '';
const pnpmVersion = /pnpm\/(\d+)\.\d+\.\d+/.exec(userAgent)?.[1];
if (pnpmVersion === undefined) {
  problems.push(`This repo is pnpm-only; install with pnpm ${PNPM_MAJOR}.`);
} else if (Number(pnpmVersion) < PNPM_MAJOR) {
  problems.push(`pnpm >= ${PNPM_MAJOR} is required; found pnpm ${pnpmVersion}.`);
}

if (problems.length > 0) {
  console.error(`\nUnsupported development environment:\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(`\nSee the NOTES section of AGENTS.md.\n`);
  process.exit(1);
}
