# AGENTS.md — @j1nn0/vue-modal-dialog

A single-package Vue 3 modal dialog component library. Published to npm as `@j1nn0/vue-modal-dialog`.

## Commands

| Action | Command | Notes |
|---|---|---|
| Dev server | `pnpm dev` | Vite, bound to `127.0.0.1` |
| Build | `pnpm build` | `vue-tsc --noEmit` first, then `vite build` |
| Test | `pnpm test` | `vitest run`, jsdom environment |
| Coverage | `pnpm coverage` | v8 provider; target >= 80% |
| Lint | `pnpm lint` | oxlint + eslint via npm-run-all2; no warnings tolerated |
| Format | `pnpm format` | oxfmt targeting `src/` |
| Format check | `pnpm format:check` | `oxfmt --check src/` |
| Storybook | `pnpm storybook` | port 6006, `--no-open` |

## Available tools (MCP / Serena)

This workspace is configured with two OpenCode MCP servers (`opencode.json`):

- **context7** — Remote MCP. Query library docs with `Context7 Query Docs`. Always `Context7 Resolve` a library ID first. Useful for Vue, vitest, focus-trap, Sass, etc.
- **serena** — Local MCP via `uvx`. Provides codebase-aware symbolic operations: `find_symbol`, `find_referencing_symbols`, `replace_symbol_body`, `serena_replace_content`. Preferred over raw grep/sed for structural edits.
- **Skills** — Two agent skills in `.agents/skills/`: `git-commit` (conventional-commit workflow) and `find-skills` (skill discovery).

## Validation pipeline

```
format:check → lint → test → build
```

- **Pre-commit hook** (`.husky/pre-commit`): runs `pnpm lint && pnpm test`. It does NOT run format — run `pnpm format` manually before committing.
- **CI** (`.github/workflows/ci.yml`): two parallel jobs — `lint` (format:check + oxlint + eslint) and `test-and-build` (vitest + vue-tsc + vite build). Triggers on `push`/`pull_request` to `main`.

## Key gotchas

- **Build fails without type-check**: `vue-tsc --noEmit -p tsconfig.build.json` must pass before vite build.
- **Lint is zero-tolerance**: Vite ESLint plugin has `failOnWarning: true` — warnings fail the dev server and builds.
- **ESLint enforces no-unused-vars**: unused imports break both lint and build. Remove them or prefix with `_`.
- **Custom npm registry**: `.npmrc` sets `registry=https://npm.flatt.tech/`, `engine-strict=true`.
- **Engine requirements**: Node >= 24, pnpm >= 10 (`package.json` engines). `packageManager: pnpm@10.33.0`.
- **Peer deps externalized at build**: `vue`, `@vueuse/core`, `@vueuse/integrations`, `focus-trap`.
- **pnpm-workspace**: `minimumReleaseAge: 10080` (7 days), `trustPolicy: no-downgrade`.

## Architecture

```
src/
├── types.ts                  # Shared VueModalDialogProps (also reused in StackEntry)
├── index.ts                  # Public API: component + plugin + type exports
├── components/
│   ├── VueModalDialog.vue    # Main component (orchestrates 4 composables)
│   ├── __tests__/            # Component-level tests
│   └── VueModalDialog.stories.js
└── composables/
    ├── useDialogState.ts     # Open/close, focus trap, body class, lifecycle emits
    ├── useDialogSize.ts      # Preset/custom width → CSS class + style
    ├── useDialogMode.ts      # light/dark mode, reactive to prefers-color-scheme
    ├── useDialogStack.ts     # Singleton stack manager (push/pop/top/subscribe)
    └── __tests__/            # Composable unit tests
```

- **Import alias**: `@/` → `src/` (tsconfig.json, vite.config.ts).
- **Public API** (`src/index.ts`): exports `VueModalDialog`, `VueModalDialogPlugin`, `VueModalDialogProps` (type), `VueModalDialogPluginOptions` (type).
- **Focus restoration**: `useDialogStack` saves `document.activeElement` when the first dialog opens and restores it when the last one closes.
- **`closed` emit timing**: emitted via `nextTick()` from the component's `watch(isOpen)` handler — not synchronously — to let Vue process the DOM change first.

## Testing

- Framework: Vitest + jsdom. `@vue/test-utils` for component mounts.
- Tests colocated with source:
  - `src/composables/__tests__/*.test.ts` — composable unit tests
  - `src/components/__tests__/*.test.ts` — component integration tests
  - `src/__tests__/*.test.ts` — public API tests (plugin)
- Mocking: `vi.mock()` with factory functions. See `useDialogState.test.ts` for the focus-trap mock pattern.
- Coverage target: >= 80% (branches, lines).
- Component tests: use `mount(VueModalDialog, { props: { modelValue: ... } })`. Open dialogs with `setProps({ modelValue: true })` rather than mounting with `true` (so watchers fire).

## Code conventions

- Vue 3 Composition API, `<script setup>`, `defineProps`, `defineEmits`, `defineModel`.
- 2-space indent, LF, max 100 cols (`.editorconfig`, `.oxfmtrc.json`).
- Single quotes, semicolons required (oxfmt).
- Composable naming: `use*` prefix, one file per composable.
- CSS: custom properties prefixed `--j1nn0-vue-modal-dialog-*`. Scoped SCSS in the component. Autoprefixer via PostCSS.
- JSDoc: all public functions, composable return types, and exported interfaces should have JSDoc (`@param`, `@returns`, `@default`, `@example`).
- SSR guards: always wrap browser APIs in `typeof document !== 'undefined'` / `typeof window !== 'undefined'`.

## Release

1. `pnpm build`
2. `npm version patch|minor|major`
3. `make push` (or `make release-*`)
4. CI publishes to npm on version tags — no manual publish step.

## Reference docs

- `.github/copilot-instructions.md` — primary architecture/code style reference
- `.github/instructions/testing.instructions.md` — test writing rules
- `.github/instructions/readme-sync.instructions.md` — README maintenance
- `.github/prompts/api-compat-check.prompt.md` — breaking-change checklist
- `.github/release-maintainer-guide.md` — release flow details
- `README.md` / `README.ja.md` — consumer-facing docs
