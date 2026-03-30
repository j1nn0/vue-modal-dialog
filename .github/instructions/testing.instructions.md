---
description: "Use when writing or updating Vitest tests, unit tests, mock setup, coverage checks, regression tests, or composable/component behavior tests."
name: "Testing Guidelines"
applyTo: "src/composables/__tests__/**/*.test.js"
---
# Testing Guidelines

- Follow existing Vitest style in `src/composables/__tests__/` (clear arrange-act-assert flow and readable test names).
- Prefer colocated mocks with `vi.mock(...)` patterns already used in this repository.
- Cover both success and edge behavior for changed logic (state transitions, emitted events, and cleanup paths).
- Preserve SSR-safe behavior by testing browser API guards when relevant.
- Coverage target is >= 80% for changed areas. If this cannot be met, explain the gap and list concrete follow-up tests.
- Validate locally with `pnpm test`; use `pnpm coverage` when behavior changes materially.
