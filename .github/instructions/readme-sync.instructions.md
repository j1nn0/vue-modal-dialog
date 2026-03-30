---
description: "Use when updating README content, documentation, usage docs, installation steps, props, emits, slots, peer dependencies, accessibility notes, or examples for the modal dialog library."
name: "README Sync Guidelines"
applyTo: "README.md"
---
# README Sync Guidelines

- Keep README aligned with the actual public API in `src/components/VueModalDialog.vue`, `src/index.js`, and `types/index.d.ts`.
- When props, emits, slots, defaults, or behavior change, update the affected README sections in the same task.
- Recheck these sections before finishing: Installation, Peer Dependencies, Usage, Props, Slots, Accessibility, Styles, and Notes on Multiple Modals.
- Keep both usage paths accurate when relevant: individual import and global plugin registration.
- Ensure examples match current behavior and naming, including `v-model`, slot names, and import paths.
- Do not duplicate low-level implementation details that already belong in source files or stories; keep README user-focused.
- If behavior changed but README intentionally stays unchanged, state why in the final response.