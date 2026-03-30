# Project Guidelines

## Code Style
- Use Vue 3 Composition API with `<script setup>` for components. Prefer `defineProps`, `defineEmits`, and `defineModel` patterns used in `src/components/VueModalDialog.vue`.
- Keep imports using the `@/` alias for `src` paths (configured in `jsconfig.json`).
- Keep composables in `src/composables/` with `use*` naming.
- Keep tests colocated under `src/composables/__tests__/` and follow existing Vitest mocking patterns.
- Follow repository formatting/linting defaults (2 spaces, LF, max line length 100 via `.editorconfig`).

## Architecture
- This is a Vue component library centered on `src/components/VueModalDialog.vue`.
- Business logic is split into composables:
  - `useDialogState`: open/close state, focus trap, body class, lifecycle emits
  - `useDialogSize`: preset/custom width computation
  - `useDialogMode`: explicit/system light-dark mode handling
- Maintain this separation: component orchestrates UI and props; composables own focused behavior.
- Public exports are defined in `src/index.js` (component + plugin). Keep API-compatible changes intentional.

## Build And Test
- Use Node >= 24 and pnpm >= 10 (see `package.json` engines).
- Install dependencies: `pnpm install`
- Local validation before finishing work:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- Coverage target: aim for >= 80% when adding or changing behavior.
- Lint is strict in this repo:
  - `pnpm lint` runs both oxlint and eslint.
  - Vite ESLint plugin is configured with `failOnWarning: true`, so warnings can fail builds.

## Conventions
- Preserve accessibility behavior in dialog changes (role, `aria-modal`, labeled/described IDs, keyboard and backdrop close behavior).
- Preserve SSR-safe guards around browser APIs (`typeof window !== 'undefined'`).
- Keep Storybook stories in `src/components/VueModalDialog.stories.js` aligned with component props/behavior when making UI API changes (recommended).
- Keep styling via existing CSS custom properties and scoped SCSS patterns in `src/components/VueModalDialog.vue`.

## Reference Docs
- See `README.md` for usage, props, slots, installation, and Storybook details.
- See `SECURITY.md` for vulnerability reporting policy.
