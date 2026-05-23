# AGENTS.md — src/composables

Composable-specific guidance for the dialog internals. Use this with the root `AGENTS.md`, not instead of it; the root file still owns repo-wide conventions.

## Overview

- Keep one concern per file. Current split is state, stack, size, mode, drag, and imperative open/close.
- Preserve SSR guards around `window` / `document` access.
- Keep public composable APIs typed and documented with JSDoc.

## Composable catalog

- `useDialog.ts` — imperative API that mounts a standalone Vue app into `document.body`.
- `useDialogState.ts` — open/close lifecycle, focus-trap activation, and legacy vs stack-aware behavior.
- `useDialogSize.ts` — width preset/custom width and position → class/style mapping.
- `useDialogMode.ts` — explicit mode or `prefers-color-scheme` driven reactive mode.
- `useDialogStack.ts` — module-level stack manager for top dialog, scroll lock, and focus restore.
- `useDialogDrag.ts` — pointer-driven drag offsets and inline transform style.

## Singleton pattern

- `useDialogStack` is a singleton object, not a composable function returning fresh state.
- Import it and call methods directly (`push`, `pop`, `top`, `topId`, `count`, `indexOf`, `subscribe`, `unsubscribe`).
- Treat stack state as global process state in tests; always clean it up between cases.
- Preserve the first-open / last-close focus restoration behavior when changing stack logic.
- `_getStack()` exists for test introspection; treat it as internal rather than production API.

## Inter-composable contracts

- `VueModalDialog.vue` coordinates these files; avoid moving orchestration back into one composable.
- `useDialogState()` has two modes:
  - without `dialogId` → legacy path manages body class and focus trap directly
  - with `dialogId` → stack-aware path delegates top-dialog coordination to `useDialogStack`
- `useDialogState` and `useDialogStack` must stay aligned on modal semantics, focus-trap activation, and close timing.
- `useDialogDrag` must stay inert when the dialog is closed or fullscreen.

## Testing patterns

- Composable tests live in `src/composables/__tests__/` and follow the repo's colocated Vitest style.
- Prefer `vi.mock()` factory mocks in composable tests; see `useDialogState.test.ts`.
- Reuse `createUseFocusTrapMock()` from `src/test-utils.ts` when a focus-trap mock is needed.
- Call `clearDialogStack()` in `afterEach` for stack-aware tests.
- When asserting watcher-driven behavior, wait for the required `nextTick()` chain instead of mutating internal state directly.

## Adding or changing a composable

- Keep the `use*` naming convention and one primary concern per file.
- Add or update colocated `*.test.ts` coverage for success path, cleanup path, and SSR-safe behavior.
- Keep return types explicit when the API is exported or consumed across files.
- If a new composable introduces shared state, document whether it is per-instance or singleton.
