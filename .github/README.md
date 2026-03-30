# .github Index

This directory contains shared workspace automation, AI customization files, and maintainer-facing guides.

For usage patterns and example workflows, see [customizations-guide.md](customizations-guide.md).

## AI Defaults

- [copilot-instructions.md](copilot-instructions.md)
  - Project-wide coding defaults and validation expectations.

## Instructions

- [instructions/testing.instructions.md](instructions/testing.instructions.md)
  - Test-writing guidance for files under `src/composables/__tests__/`.

- [instructions/readme-sync.instructions.md](instructions/readme-sync.instructions.md)
  - README synchronization guidance for public API and usage docs.

## Prompt

- [prompts/api-compat-check.prompt.md](prompts/api-compat-check.prompt.md)
  - API compatibility and semver impact review prompt.

## Agents

- [agents/docs-sync.agent.md](agents/docs-sync.agent.md)
  - Documentation sync agent for README and Storybook.

- [agents/test-impact.agent.md](agents/test-impact.agent.md)
  - Test impact analysis agent for regression and coverage planning.

## Hooks

- [hooks/quality-gate-on-stop.json](hooks/quality-gate-on-stop.json)
  - Runs the stop hook for repository validation.

- [hooks/run-quality-gate-on-stop.mjs](hooks/run-quality-gate-on-stop.mjs)
  - Helper script that runs `pnpm format && pnpm lint && pnpm test` when relevant files changed.

## Guides

- [customizations-guide.md](customizations-guide.md)
  - How to use the workspace AI customizations.

- [release-maintainer-guide.md](release-maintainer-guide.md)
  - Maintainer-facing release checklist and versioning flow.

## Infrastructure

- [workflows](workflows)
  - GitHub Actions workflows.

- [dependabot.yml](dependabot.yml)
  - Dependency update automation.