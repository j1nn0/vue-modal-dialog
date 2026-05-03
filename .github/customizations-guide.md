# AI Customizations Guide

This workspace includes a small set of AI customizations for implementation, testing, docs, and release review.

For the full file catalog, see [README.md](README.md).

## Core Split

- `copilot-instructions.md` sets the always-on project defaults.
- `instructions/*.instructions.md` refine work inside specific files.
- `prompts/*.prompt.md` handle one-shot structured review tasks.
- `agents/*.agent.md` handle focused analysis or sync tasks.
- `hooks/*` automate validation at lifecycle boundaries.

## When To Use What

- Use the testing instruction when editing files under `src/composables/__tests__/`.
- Use the README sync instruction when editing `README.md`.
- Use the API compatibility prompt before merging or releasing public API changes.
- Use the docs sync agent after changing props, emits, slots, defaults, or examples.
- Use the test impact agent after changing behavior, state flow, cleanup logic, or coverage-sensitive code.
- Rely on the stop hook to run `pnpm format && pnpm lint && pnpm test` when relevant files changed.

## Typical Workflows

### Change component behavior

1. Implement the change.
2. Use the test impact agent to identify missing or affected tests.
3. If API or behavior changed, use the docs sync agent to check README and Storybook.
4. If the public API changed, run the API compatibility prompt.

### Update tests only

1. Edit files under `src/composables/__tests__/`.
2. Follow the auto-attached testing instruction.
3. Validate with `pnpm test` or `pnpm coverage` when coverage changed materially.

### Update README only

1. Edit `README.md`.
2. Follow the auto-attached README sync instruction.
3. Recheck examples, props, slots, and installation details against source.

## Example Prompts

- `Use Test Impact Agent to review the changes in useDialogMode and tell me which tests to add.`
- `Use Docs Sync Agent to compare VueModalDialog.vue with README.md and stories.`
- `/API Compatibility Check Added a new prop to VueModalDialog and changed its default behavior. Is this patch, minor, or major?`

## Sample Inputs To Try

### Testing Instruction

Open a file under `src/composables/__tests__/` and ask:

- `Add regression tests for the dialog close behavior when Escape is disabled.`
- `Update the Vitest mocks for useDialogState and improve coverage for cleanup paths.`

### README Sync Instruction

Open `README.md` and ask:

- `Update the README to document the new prop and adjust the usage example.`
- `Check whether the Accessibility and Props sections still match the component implementation.`

### Test Impact Agent

- `Use Test Impact Agent to review the changes in useDialogState and list the tests that should be added or updated.`
- `Use Test Impact Agent to analyze whether the useDialogMode changes need new regression tests.`

### Docs Sync Agent

- `Use Docs Sync Agent to compare VueModalDialog.vue, README.md, and stories, then update mismatches.`
- `Use Docs Sync Agent to verify that the documented slots and examples still match the component.`

### API Compatibility Prompt

- `/API Compatibility Check Removed a prop default and renamed an emitted event. What is the release impact?`
- `/API Compatibility Check Added a new slot and changed width handling. Review compatibility and docs impact.`