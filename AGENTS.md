# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-24 00:40 JST  
**Commit:** d56b74c  
**Branch:** main

## OVERVIEW

Vue 3 modal dialog component library published as `@j1nn0/vue-modal-dialog`.
Library-mode Vite build, colocated Vitest coverage, and a small source tree with two real hotspots: `src/components/` and `src/composables/`.

## STRUCTURE

```text
.
├── src/
│   ├── index.ts              # public API exports
│   ├── types.ts              # shared props/emits/slots/expose types
│   ├── components/           # dialog component, stories, integration tests
│   ├── composables/          # state/stack/size/mode/drag/imperative API
│   └── __tests__/            # public API tests
├── .github/workflows/        # CI + npm publish automation
├── .storybook/               # Storybook config
└── AGENTS.md                 # repo-wide guidance; child docs below
```

## AGENTS HIERARCHY

- `AGENTS.md` — repo-wide commands, release/build constraints, top-level routing.
- `src/components/AGENTS.md` — component orchestration, Storybook, integration-test patterns.
- `src/composables/AGENTS.md` — composable contracts, singleton stack rules, composable tests.

## WHERE TO LOOK

| Task                                | Location                                                                         | Notes                                        |
| ----------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| Public API/export changes           | `src/index.ts`, `src/types.ts`                                                   | Consumer-facing contract                     |
| Dialog rendering/ARIA/Teleport      | `src/components/VueModalDialog.vue`                                              | Main orchestration layer                     |
| Add/change stories                  | `src/components/VueModalDialog.stories.ts`                                       | Storybook coverage of props and flows        |
| Programmatic API                    | `src/composables/useDialog.ts`                                                   | Mounts standalone Vue app                    |
| Test helpers / mocks                | `src/test-utils.ts`                                                              | Shared across component and composable tests |
| Multi-dialog stack/focus restore    | `src/composables/useDialogStack.ts`                                              | Singleton state; clean up in tests           |
| Open/close lifecycle and focus trap | `src/composables/useDialogState.ts`                                              | Legacy vs stack-aware paths                  |
| Build/lint/test pipeline            | `package.json`, `vite.config.ts`, `vitest.config.js`, `.github/workflows/ci.yml` | Zero-tolerance validation                    |
| Release flow                        | `Makefile`, `.github/workflows/publish.yml`                                      | Tag-driven npm publish                       |

## CODE MAP

| Symbol                         | Type                                        | Location                            | Role                              |
| ------------------------------ | ------------------------------------------- | ----------------------------------- | --------------------------------- |
| `VueModalDialogPlugin.install` | method                                      | `src/index.ts`                      | Global registration entry         |
| `VueModalDialogProps`          | interface                                   | `src/types.ts`                      | Shared prop contract              |
| `requestClose`                 | function                                    | `src/components/VueModalDialog.vue` | Guarded close path                |
| `useDialog`                    | function                                    | `src/composables/useDialog.ts`      | Imperative consumer API           |
| `useDialogState`               | function                                    | `src/composables/useDialogState.ts` | Lifecycle + focus-trap logic      |
| `useDialogStack`               | singleton object (not a factory composable) | `src/composables/useDialogStack.ts` | Stack, scroll lock, focus restore |

## CONVENTIONS

- Vue 3 Composition API with `<script setup lang="ts">`; keep logic typed and small.
- `@/` resolves to `src/`; prefer it over long relative imports.
- Oxfmt style is strict: 2 spaces, LF, single quotes, semicolons, 100 columns.
- Public exports and shared interfaces need JSDoc.
- Browser APIs always need SSR guards (`typeof document/window !== 'undefined'`).
- Tests are colocated; mount dialogs closed, then open with `setProps({ modelValue: true })`.

## ANTI-PATTERNS (THIS PROJECT)

- Do not bypass `vue-tsc --noEmit -p tsconfig.build.json`; build depends on it.
- Do not ignore lint warnings; `vite-plugin-eslint` runs with `failOnWarning: true`.
- Do not leave unused imports; lint/build fail unless intentionally `_`-prefixed.
- Do not treat `useDialogStack` as per-instance state.
- Do not mount component tests initially open when watcher behavior matters.
- Do not reference the removed `.github/instructions/*` or prompt docs; they are not in this repo.

## UNIQUE STYLES

- CSS custom properties are namespaced `--j1nn0-vue-modal-dialog-*`.
- Peer deps (`vue`, `@vueuse/core`, `@vueuse/integrations`, `focus-trap`) stay external in library build.
- Storybook and tests both exercise stacked dialogs, lifecycle emits, and accessibility behavior.

## COMMANDS

```bash
pnpm dev
pnpm storybook
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm coverage
make release-patch|release-minor|release-major
```

## NOTES

- Validation order: `format:check -> lint -> test -> build`.
- CI splits into `lint` and `test-and-build`; publish runs only on `v*.*.*` tags.
- Pre-commit runs `pnpm lint-staged` and `pnpm test`; format is still manual.
- Node >= 24 and pnpm >= 10 are enforced; `.npmrc` points installs at `https://npm.flatt.tech/`.
- Read the child AGENTS before changing `src/components/` or `src/composables/` internals.
