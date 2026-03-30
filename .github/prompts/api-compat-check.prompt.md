---
description: "Run an API compatibility review for breaking changes, semver impact, public exports, component props, emits, slots, defaults, or release readiness before release."
name: "API Compatibility Check"
argument-hint: "変更内容、対象ファイル、想定リリース種別（patch/minor/major）"
agent: "agent"
---
Review the requested changes with a strict API-compatibility mindset.

## Scope
- Public exports in `src/index.js`
- Component props/emits/slots in `src/components/VueModalDialog.vue`
- Type definitions in `types/index.d.ts`
- Usage docs/stories in `README.md` and `src/components/VueModalDialog.stories.js`

## Tasks
1. Detect breaking changes in public API surface.
2. Classify each change as patch/minor/major impact.
3. Identify behavior regressions (accessibility, keyboard, backdrop, mode, size, focus trap lifecycle).
4. Check whether docs and stories reflect the new behavior.
5. Propose exact fixes with file-level guidance.

## Output Format
- Compatibility verdict: pass or fail
- Findings: ordered by severity, each with file reference and impact
- Required fixes before release
- Suggested version bump (patch/minor/major) with rationale
