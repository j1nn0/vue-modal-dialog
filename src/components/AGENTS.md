# AGENTS.md — src/components

Component-layer guidance for the dialog UI. Use this with the root `AGENTS.md`; composable internals live in `../composables/AGENTS.md`.

## OVERVIEW

- `VueModalDialog.vue` is the orchestration layer: it wires stack, state, size, mode, and drag composables into the rendered dialog.
- `VueModalDialog.stories.ts` is the interactive behavior matrix for props, slots, lifecycle events, and stacked flows.
- `__tests__/VueModalDialog.test.ts` is the integration contract for rendering, accessibility, stack behavior, teleport, and guarded closing.

## WHERE TO LOOK

| Task                         | Location                           | Notes                                                       |
| ---------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| Add or change dialog markup  | `VueModalDialog.vue`               | Teleport, transitions, ARIA, header/body/footer structure   |
| Adjust orchestration logic   | `VueModalDialog.vue`               | Stack push/pop, close paths, top-dialog behavior            |
| Document or demo a feature   | `VueModalDialog.stories.ts`        | Use existing story helpers before adding ad hoc render code |
| Verify user-visible behavior | `__tests__/VueModalDialog.test.ts` | Integration cases are grouped by concern                    |

## ORCHESTRATION RULES

- Keep cross-composable coordination in `VueModalDialog.vue`; do not push rendering concerns back into composables.
- `requestClose()` is the guarded close path. It emits `before-close`, awaits `beforeClose`, and only then flips `modelValue`.
- Stack lifecycle is component-owned: open pushes into `useDialogStack`, close pops, unmount always unsubscribes and pops.
- `closed` is intentionally deferred with `nextTick()` after stack pop so DOM/transition work settles first.

## RENDERING AND ACCESSIBILITY

- Teleport target is computed from `teleport`: `true -> body`, `string -> selector`, otherwise in-place rendering.
- Only the top modal renders the backdrop and handles Escape/backdrop-close behavior.
- `aria-modal` and `aria-hidden` depend on stack position; preserve that top-vs-lower dialog distinction.
- Header/body IDs are generated for `aria-labelledby` and `aria-describedby`; keep those bindings intact when changing structure.
- `role="alertdialog"` forces effective static-backdrop semantics; do not loosen that contract casually.

## STORYBOOK PATTERNS

- Prefer the existing helper pattern: `usePlayground()` for counters/body mode class handling and `renderSimpleStory()` for low-ceremony examples.
- Keep stories behavior-focused: stacked dialogs, lifecycle events, custom widths, modes, static/no backdrop, and form content already define the coverage baseline.
- Story code that touches `document` must keep SSR guards, even though Storybook is browser-first.

## TESTING PATTERNS

- Mount dialogs closed, then open with `setProps({ modelValue: true })`; this ensures watchers and stack hooks run.
- Component integration tests use `vi.hoisted()` for the focus-trap mock; keep that pattern instead of the composable `vi.mock()` factory style.
- `openDialog()` / `closeDialog()` intentionally await three `nextTick()` calls to let transition-driven updates settle.
- Always `clearDialogStack()` in `afterEach`; this test file exercises singleton state heavily.
- Teleport tests should create explicit target elements and remove them during cleanup.

## ANTI-PATTERNS

- Do not make fullscreen dialogs draggable.
- Do not remove the capture-phase pointerdown fallback without replacing the swallowed-backdrop-click coverage.
- Do not emit `closed` synchronously from the component stack-aware path.
- Do not duplicate composable unit-test assertions here; this file should stay integration-focused.
