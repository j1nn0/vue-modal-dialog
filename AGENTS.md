# AGENTS.md — vue-modal-dialog

A single-package Vue 3 modal dialog component library published as `@j1nn0/vue-modal-dialog`.

## Quick reference

| Action | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build | `pnpm build` (vue-tsc type check + vite build) |
| Test | `pnpm test` (vitest run) |
| Test w/ coverage | `pnpm coverage` |
| Lint | `pnpm lint` (oxlint + eslint via npm-run-all2) |
| Format | `pnpm format` (oxfmt) |
| Format check | `pnpm format:check` |
| Storybook | `pnpm storybook` (port 6006, no auto-open) |

## Key gotchas

- **Build is two-stage**: `vue-tsc --noEmit -p tsconfig.build.json` must pass before `vite build` runs.
- **Lint is strict**: Vite ESLint plugin has `failOnWarning: true` — warnings fail the dev server and builds.
- **Validation order**: `pnpm format:check -> pnpm lint -> pnpm test -> pnpm build`. A quality-gate hook runs `pnpm format && pnpm lint && pnpm test` automatically on agent Stop.
- **Custom npm registry**: `.npmrc` sets `registry=https://npm.flatt.tech/` with `engine-strict=true`.
- **Engine requirements**: Node >= 24, pnpm >= 10 (see `package.json` engines).
- **Peer deps are externalized** at build time: `vue`, `@vueuse/core`, `@vueuse/integrations`, `focus-trap`.
- **pnpm-workspace**: `minimumReleaseAge: 10080` (7 days before updating deps), `trustPolicy: no-downgrade`.

## Architecture

- **Public API**: `src/index.ts` exports `VueModalDialog` component + `VueModalDialogPlugin`.
- **Component**: `src/components/VueModalDialog.vue` — orchestrates UI/props; uses four composables.
- **Composables** (`src/composables/`): `useDialogState` (open/close, focus trap), `useDialogSize` (width presets), `useDialogMode` (light/dark), `useDialogStack` (singleton stack manager).
- **Import alias**: `@/` maps to `src/`.

## Testing

- Vitest + jsdom. Tests colocated at `src/composables/__tests__/*.test.ts`.
- Coverage target >= 80%.
- Existing mocks use `vi.mock(...)` patterns — follow those for consistency.

## Code style

- 2-space indent, LF, 100 line length (`.editorconfig`).
- Single quotes, semicolons (`.oxfmtrc.json`).
- Vue 3 Composition API with `<script setup>`, `defineProps`, `defineEmits`, `defineModel`.

## CSS

- All custom properties prefixed `--j1nn0-vue-modal-dialog-*`.
- SCSS with scoped styles in the component.
- `postcss.config.js` with autoprefixer.

## Release

- `pnpm build` first, then `npm version patch|minor|major`, then `make push` (or `make release-*`).
- CI auto-publishes to npm on version tags; no manual publish needed.

## Existing instructions (read these too)

- `.github/copilot-instructions.md` — primary source for code style, architecture, conventions.
- `.github/instructions/testing.instructions.md` — test writing guidelines.
- `.github/instructions/readme-sync.instructions.md` — README maintenance rules.
- `.github/prompts/api-compat-check.prompt.md` — breaking-change checklist.
- `.github/release-maintainer-guide.md` — release flow details.
