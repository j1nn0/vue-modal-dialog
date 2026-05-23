# AGENTS.md — src/composables

Composable-specific guidance for dialog internals. Use this with the root `AGENTS.md`; component-layer orchestration lives in `../components/AGENTS.md`.

## OVERVIEW

- One concern per file: imperative API, state, stack, size, mode, drag.
- Preserve SSR guards around `window` / `document` access.
- Keep exported APIs typed and documented with JSDoc.

## COMPOSABLE CATALOG

- `useDialog.ts` — imperative API that mounts a standalone Vue app into `document.body`.
- `useDialogState.ts` — open/close lifecycle, focus trap, body class, legacy vs stack-aware behavior.
- `useDialogSize.ts` — width preset/custom width and position → class/style mapping.
- `useDialogMode.ts` — explicit mode or `prefers-color-scheme` reactive mode.
- `useDialogStack.ts` — module-level stack manager for top dialog, scroll lock, and focus restore.
- `useDialogDrag.ts` — pointer-driven drag offsets and inline transform style.

## WHERE TO LOOK

| Task                         | Location            | Notes                                  |
| ---------------------------- | ------------------- | -------------------------------------- |
| Programmatic open/close      | `useDialog.ts`      | Creates and tears down standalone apps |
| Focus trap / lifecycle emits | `useDialogState.ts` | Two execution paths                    |
| Multi-dialog ordering        | `useDialogStack.ts` | Singleton object; global test state    |
| Width / position mapping     | `useDialogSize.ts`  | Presets and custom widths              |
| Theme behavior               | `useDialogMode.ts`  | Explicit mode vs media query           |
| Drag behavior                | `useDialogDrag.ts`  | Must stay inert when closed/fullscreen |

## SINGLETON PATTERN

- `useDialogStack` is a singleton object, not a factory composable.
- Import it and call methods directly (`push`, `pop`, `top`, `topId`, `count`, `indexOf`, `subscribe`, `unsubscribe`).
- Preserve first-open / last-close focus restoration when changing stack logic.
- `_getStack()` is test introspection only, not production API.

## INTER-COMPOSABLE CONTRACTS

- `VueModalDialog.vue` coordinates these files; keep orchestration in the component layer.
- `useDialogState()` without `dialogId` uses the legacy path and manages focus/body state directly.
- `useDialogState()` with `dialogId` becomes stack-aware and must stay aligned with `useDialogStack` on modal semantics, focus trap activation, and close timing.
- `useDialogDrag` must no-op when the dialog is closed or fullscreen.

## TESTING PATTERNS

- Tests live in `src/composables/__tests__/` and use colocated Vitest style.
- Prefer `vi.mock()` factory mocks in composable tests; reuse `createUseFocusTrapMock()` from `src/test-utils.ts`.
- Call `clearDialogStack()` in `afterEach` for stack-aware tests.
- When asserting watcher-driven behavior, wait for the required `nextTick()` chain instead of mutating internal state directly.
- Cover success path, cleanup path, and SSR-safe behavior for new composables.

## ANTI-PATTERNS

- Do not move shared stack state into per-instance composables.
- Do not change one `useDialogState` path without checking the other.
- Do not expose `_getStack()` semantics as consumer API.
- Do not add browser API access without SSR guards.
