# Changelog

## [1.0.0](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.11...v1.0.0) (2026-08-13)

## [1.0.0-rc.11](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2026-08-13)

### Bug Fixes

* **a11y:** move focus into the dialog when initialFocus is unset ([ee42fee](https://github.com/j1nn0/vue-modal-dialog/commit/ee42fee87bebdff7e75a89c2df657c93f3d61a90))

### Documentation

* **ja:** correct the Programmatic API example ([76f47ae](https://github.com/j1nn0/vue-modal-dialog/commit/76f47ae47709a0266708d09e8d9aa243f35c67f0))

### Chore

* **release:** make non-fix commit types reach the changelog ([4d18841](https://github.com/j1nn0/vue-modal-dialog/commit/4d188419ab631b03c156548b43faa039350a6b43))
* split the consumer engine floor from the development one ([be7e31d](https://github.com/j1nn0/vue-modal-dialog/commit/be7e31d4f70ed3db4477b2b076ea7facfc5ee4b0))

## [1.0.0-rc.10](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2026-08-13)

## [1.0.0-rc.9](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2026-08-13)

### Bug Fixes

* **types:** restore consumer-facing component types ([2bb5c19](https://github.com/j1nn0/vue-modal-dialog/commit/2bb5c196298bcdc77bf9e12e7ef6417c32a2aeb7))

## [1.0.0-rc.8](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2026-08-13)

## [1.0.0-rc.7](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2026-08-13)

### Bug Fixes

* **dialog:** prevent duplicate close requests ([ede8d10](https://github.com/j1nn0/vue-modal-dialog/commit/ede8d10984e8f6ce6157b4a4ddc3f24ee8796093))

## [1.0.0-rc.6](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2026-08-13)

### ⚠ BREAKING CHANGES

* harden dialog accessibility and closing

### Features

* harden dialog accessibility and closing ([f74a465](https://github.com/j1nn0/vue-modal-dialog/commit/f74a465289b5b2d8d665fecc8093242426165d8c))

## [1.0.0-rc.5](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2026-08-13)

### ⚠ BREAKING CHANGES

* make dialogs modal-only

### Features

* make dialogs modal-only ([a4577bf](https://github.com/j1nn0/vue-modal-dialog/commit/a4577bf0bb124000d377a515f45731de381970e0))

## [1.0.0-rc.4](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2026-08-13)

### Bug Fixes

* **publish:** preserve tagged sources and stable dist-tags ([493649e](https://github.com/j1nn0/vue-modal-dialog/commit/493649e412011e229e411df405b6b160547d64b6))

## [1.0.0-rc.3](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2026-08-13)

### Bug Fixes

* **release:** gate publishing and close immediate dialogs ([92fadba](https://github.com/j1nn0/vue-modal-dialog/commit/92fadba5dcbd414391c233b2c297a563d4658147))

## [1.0.0-rc.2](https://github.com/j1nn0/vue-modal-dialog/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2026-08-13)

### ⚠ BREAKING CHANGES

- **package:** CommonJS output is now `dist/vue-modal-dialog.umd.cjs`. Import styles from `@j1nn0/vue-modal-dialog/style.css`; legacy `dist/*` paths remain exported for compatibility.

### Features

- **events:** add `after-leave`, fired when the dialog panel's leave transition completes.

### Bug Fixes

- **dialog:** support dialogs initially mounted with `v-model` set to `true`.
- **useDialog:** wait for Vue's leave lifecycle before unmounting imperative dialogs.
- **package:** support native Node ESM and CommonJS resolution through an explicit exports map.

### Chore

- **deps:** update the development toolchain and resolve known dependency advisories.
- **types:** type-check Vite and Storybook configuration.

## [1.0.0-rc.1](https://github.com/j1nn0/vue-modal-dialog/compare/v0.13.5...v1.0.0-rc.1) (2026-08-13)

### ⚠ BREAKING CHANGES

- **a11y:** `aria-describedby` is no longer generated, and
  `aria-labelledby` is omitted when no header slot is supplied. Both now
  reference the title element rather than the header.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

- **useDialog:** `useDialog().open()` returns a promise instead of
  undefined, and accepts content options alongside the dialog props. It is
  an imperative mount API, not the state holder the README previously
  described.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

- **events:** `opened` now fires after the DOM update rather than
  synchronously when the open state changes, and after `before-open` and
  `opening` rather than before them.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

- **backdrop:** `backdrop: false` no longer renders a backdrop element.
  Outside-click dismissal now requires a completed click on the backdrop,
  so it no longer occurs for non-modal dialogs or for clicks on elements
  that merely lie outside the dialog root.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

### Features

- **types:** offer width presets as completions ([78b8cd1](https://github.com/j1nn0/vue-modal-dialog/commit/78b8cd1a293e34cdc7eb92a51f815265e508e869))
- **useDialog:** render content and resolve a result ([ca9677d](https://github.com/j1nn0/vue-modal-dialog/commit/ca9677d45dd9d48bb838ad81d430eecf8abd21ad))

### Bug Fixes

- **a11y:** meet target size, focus visibility and reduced motion ([41ca7fe](https://github.com/j1nn0/vue-modal-dialog/commit/41ca7fef3fcfd189bc06eda6c5d2cc6340417017))
- **a11y:** name the dialog from its title, not its header ([017c164](https://github.com/j1nn0/vue-modal-dialog/commit/017c1642bf6553274a551d7ee2ef6e2ae685bd5a))
- **backdrop:** dismiss on a completed backdrop click only ([0f1c457](https://github.com/j1nn0/vue-modal-dialog/commit/0f1c457ab9ca2a9669bf386b0450de1aa5ab6f88))
- **drag:** compose drag offset with position transform ([a36337e](https://github.com/j1nn0/vue-modal-dialog/commit/a36337ec40a4adc4b475b0be100d8bed8c95e938))
- **events:** emit lifecycle events in the documented order ([bcc8e2d](https://github.com/j1nn0/vue-modal-dialog/commit/bcc8e2ded6ec6c44cdfa087a9c549bab4ce68f37))
- **publish:** add tag 'rc' to npm publish command ([827f53d](https://github.com/j1nn0/vue-modal-dialog/commit/827f53dd29bd31ad682eba4b7f61a7e12bea1cb0))
- **scroll-lock:** compensate for the removed scrollbar width ([13c40ce](https://github.com/j1nn0/vue-modal-dialog/commit/13c40cee35779d196f637e28a2e61f46f883905c))
- **transition:** use the documented backdrop transition by default ([62caab6](https://github.com/j1nn0/vue-modal-dialog/commit/62caab63ab01011974ab9185847f7db293b8c55c))

## [0.13.5](https://github.com/j1nn0/vue-modal-dialog/compare/v0.13.4...v0.13.5) (2026-07-01)

## [0.13.4](https://github.com/j1nn0/vue-modal-dialog/compare/v0.13.3...v0.13.4) (2026-07-01)

### Bug Fixes

- update pnpm version to 10.34.4 in CI configuration ([9c2a7fd](https://github.com/j1nn0/vue-modal-dialog/commit/9c2a7fd19fc3359915c373013c78f42d0036aee9))

## [0.13.3](https://github.com/j1nn0/vue-modal-dialog/compare/v0.13.1...v0.13.3) (2026-07-01)

### Features

- add new skills for grilling sessions and handoff documentation ([c95a984](https://github.com/j1nn0/vue-modal-dialog/commit/c95a98494e492e5b1ec04fa204e5c4ae2e536007))
- improve developer experience across 13 areas ([1329d02](https://github.com/j1nn0/vue-modal-dialog/commit/1329d0283154a0a35ca2273e54c86ba13a6d9666))
- update .gitignore and add composable-specific AGENTS.md documentation ([378733f](https://github.com/j1nn0/vue-modal-dialog/commit/378733fb9f04c9cfb9655e37899feea0d2310b70))
- update AGENTS.md for composables and add component-layer guidance ([59c2343](https://github.com/j1nn0/vue-modal-dialog/commit/59c2343a1b0e8be3824eddbc1f0e90cbca74a6b5))

### Bug Fixes

- update language server list and improve configuration comments in project.yml ([debc945](https://github.com/j1nn0/vue-modal-dialog/commit/debc9455b098c3dbd536b1e033a43b66509252f8))
- update pnpm version to 10.34.4 in CI workflows ([c0726b4](https://github.com/j1nn0/vue-modal-dialog/commit/c0726b4500c909189d75888e91dd203a9576ff37))

### Reverts

- Revert "chore: remove obsolete documentation and configuration files from the repository" ([ea45fa5](https://github.com/j1nn0/vue-modal-dialog/commit/ea45fa5f71b1e53688aa11b84face093454fe217))
- Revert "docs(agents): refresh repository guidance" ([591325e](https://github.com/j1nn0/vue-modal-dialog/commit/591325ee08797ae492dbbd1131930d0bad33dc0b))
- Revert "docs: add initial documentation files for project overview, style conventions, completion checklist, and suggested commands" ([bd267a4](https://github.com/j1nn0/vue-modal-dialog/commit/bd267a4d35761903022b0fa130db9d259fc997ed))
