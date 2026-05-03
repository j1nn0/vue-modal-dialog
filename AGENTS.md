# AGENTS.md — @j1nn0/vue-modal-dialog

Single-package Vue 3 component library published as `@j1nn0/vue-modal-dialog`.
`pnpm dev` runs the local demo app (`src/main.js` + `src/App.vue`); the shipped library entry is `src/index.ts`.

## Commands

- `pnpm dev` — Vite dev server on `127.0.0.1`
- `pnpm storybook` / `pnpm build-storybook`
- `pnpm test` — full Vitest run in jsdom
- `pnpm test -- src/components/__tests__/VueModalDialog.test.ts` — single test file
- `pnpm test -- -t "emits closed"` — single test name
- `pnpm lint` — runs `oxlint . --fix` then `eslint . --fix`
- `pnpm format` / `pnpm format:check` — only targets `src/`
- `pnpm build` — `vue-tsc --noEmit -p tsconfig.build.json && vite build`

## Validation Order

- Match CI: `pnpm format:check && pnpm lint && pnpm test && pnpm build`
- Pre-commit only runs `pnpm lint` and `pnpm test`; it does not run format or build checks.

## Toolchain Gotchas

- Requires Node `>=24`, pnpm `>=10`; repo pins `pnpm@10.33.0`.
- `.npmrc` uses `registry=https://npm.flatt.tech/` with `engine-strict=true`; CI also installs `flatt-security/setup-takumi-guard-npm@v1` before `pnpm install`.
- `pnpm-workspace.yaml` enables `minimumReleaseAge: 10080` and `trustPolicy: no-downgrade`.
- Vite ESLint plugin has `failOnWarning: true`; warnings break both `pnpm dev` and `pnpm build`.
- Library build excludes tests and stories via `tsconfig.build.json`; peer deps (`vue`, `@vueuse/core`, `@vueuse/integrations`, `focus-trap`) are externalized.

## Structure

- `src/index.ts` exports `VueModalDialog`, `VueModalDialogPlugin`, `useDialog`, and `VueModalDialogProps`.
- `src/components/VueModalDialog.vue` owns stacking, teleport, ARIA attrs, keyboard/backdrop close, and lifecycle emits.
- `src/composables/useDialogState.ts` manages open/close lifecycle and focus trap behavior.
- `src/composables/useDialogStack.ts` is a singleton stack manager for shared backdrop, z-index, body scroll lock, and focus restoration.
- `src/composables/useDialog.ts` is the programmatic API; it mounts a temporary app into `document.body` and no-ops under SSR.
- Tests live in `src/components/__tests__`, `src/composables/__tests__`, and `src/__tests__`.
- Storybook entry is `src/components/VueModalDialog.stories.ts`.

## Behavior Worth Preserving

- Only the topmost dialog handles Escape/backdrop close and gets `aria-modal="true"`; lower stacked dialogs are `aria-hidden="true"`.
- Focus is saved when the first dialog opens and restored only after the last dialog closes.
- `closed` is emitted on `nextTick()`, not synchronously with `modelValue = false`.
- `alertdialog` with `modal=false` intentionally warns in dev.
- Non-modal dialogs force `scrollLock` off when added to the stack.

## Conventions

- Vue 3 Composition API with `<script setup lang="ts">`; alias `@/` maps to `src/`.
- Formatting: 2 spaces, LF, single quotes, semicolons, max 100 cols.
- Oxfmt ignores `.github/**`; formatting commands only touch `src/`, so Markdown/config edits are not auto-formatted.
- Unused TypeScript vars/args must be prefixed with `_` to satisfy ESLint.
- Consumer docs exist in both `README.md` and `README.ja.md`.

## Release

- `make release-patch|minor|major` runs `npm version ...` then `git push origin main --tags`.
- Publish is tag-driven: pushing `v*.*.*` runs `.github/workflows/publish.yml`, which builds and publishes with `pnpm publish --registry https://registry.npmjs.org/ --provenance`.
