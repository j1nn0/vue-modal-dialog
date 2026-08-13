# AGENTS.md — src/composables

Composable-specific guidance for dialog internals. Use this with the root `AGENTS.md`; component-layer orchestration lives in `../components/AGENTS.md`.

## OVERVIEW

- One concern per file: imperative API, state, stack, size, mode, drag.
- Preserve SSR guards around `window` / `document` access.
- Keep exported APIs typed and documented with JSDoc.

## COMPOSABLE CATALOG

- `useDialog.ts` — imperative API that mounts a standalone Vue app into `document.body`, renders slot content, and resolves a promise on close.
- `useDialogState.ts` — focus trap for a stack-aware dialog; emits `opened` after the DOM update.
- `useDialogSize.ts` — width preset/custom width and position → class/style mapping.
- `useDialogMode.ts` — explicit mode or `prefers-color-scheme` reactive mode.
- `useDialogStack.ts` — module-level stack manager for top dialog, dialog ids, scroll lock (incl. scrollbar-width compensation), and focus restore.
- `useDialogDrag.ts` — pointer-driven drag offsets, clamped to the viewport, applied via the CSS `translate` property.

## WHERE TO LOOK

| Task                       | Location            | Notes                                    |
| -------------------------- | ------------------- | ---------------------------------------- |
| Programmatic open/close    | `useDialog.ts`      | Creates and tears down standalone apps   |
| Focus trap / `opened` emit | `useDialogState.ts` | Requires `dialogId` and a close callback |
| Multi-dialog ordering      | `useDialogStack.ts` | Singleton object; global test state      |
| Width / position mapping   | `useDialogSize.ts`  | Presets and custom widths                |
| Theme behavior             | `useDialogMode.ts`  | Explicit mode vs media query             |
| Drag behavior              | `useDialogDrag.ts`  | Must stay inert when closed/fullscreen   |

## SINGLETON PATTERN

- `useDialogStack` is a singleton object, not a factory composable.
- Import it and call methods directly (`push`, `pop`, `setScrollLock`, `top`, `topId`, `count`, `indexOf`, `subscribe`, `unsubscribe`).
- Preserve first-open / last-close focus restoration when changing stack logic.
- `_getStack()` is test introspection only, not production API.

## INTER-COMPOSABLE CONTRACTS

- `VueModalDialog.vue` coordinates these files; keep orchestration in the component layer.
- `useDialogState()` requires `dialogId` and a `Promise<boolean>` close callback; it is stack-aware only and must stay aligned with `useDialogStack` on modal semantics, focus trap activation, and close timing.
- `useDialogStack` is the single owner of the `vue-modal-open` body class and of scroll-lock padding; each entry stores only its `scrollLock` flag.
- `setScrollLock(id, enabled)` updates registered entries immediately and notifies subscribers; unknown ids are no-ops.
- `useDialog()` keeps its own pending guard around the component's `requestClose()` result; preserve both guards when changing imperative close timing.
- Dialog ids come from `useDialogStack.nextId()`, never Vue's `useId()`: ids must not collide across the separate apps that `useDialog()` mounts.
- `useDialogDrag` must no-op when the dialog is closed or fullscreen.

## TESTING PATTERNS

- Tests live in `src/composables/__tests__/` and use colocated Vitest style.
- Prefer `vi.mock()` factory mocks in composable tests; reuse `createUseFocusTrapMock()` from `src/test-utils.ts`.
- Call `clearDialogStack()` in `afterEach` for stack-aware tests.
- When asserting watcher-driven behavior, wait for the required `nextTick()` chain instead of mutating internal state directly.
- Cover success path, cleanup path, and SSR-safe behavior for new composables.

## ANTI-PATTERNS

- Do not move shared stack state into per-instance composables.
- Do not reintroduce a non-stack-aware `useDialogState` path; the stack owns body-class and scroll-lock state.
- Do not expose `_getStack()` semantics as consumer API.
- Do not add browser API access without SSR guards.
