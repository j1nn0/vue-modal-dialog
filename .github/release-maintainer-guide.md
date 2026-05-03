# Release Maintainer Guide

This guide summarizes the release steps that are explicitly defined in this repository.

## Environment

- Node.js 24 or later
- pnpm 10 or later

## Pre-Release Checks

Run these locally before creating a release:

```bash
pnpm install
pnpm format
pnpm lint
pnpm test
pnpm build
```

Notes:

- `pnpm lint` runs both oxlint and eslint.
- The Vite ESLint plugin is configured with `failOnWarning: true`, so warnings can fail validation.
- CI currently runs `pnpm test` and `pnpm build` on pushes and pull requests to `main`.

## Version Bump And Tag

The repository provides Make targets for versioning and pushing tags:

```bash
make release-patch
make release-minor
make release-major
```

These targets currently do the following:

1. Run `npm version patch|minor|major`
2. Push `main` and tags with `git push origin main --tags`

## Suggested Release Flow

1. Start from an up-to-date `main` branch.
2. Run the local validation commands.
3. Choose the correct release type: patch, minor, or major.
4. Run the matching Make target.
5. Confirm that CI passes on the pushed commit and tag.

## Important Scope Note

This repository defines version bumping and tag pushing in `Makefile`. Publishing to npm is automated via `.github/workflows/publish.yml`, which triggers on version tags (`v*.*.*`) and publishes to the npm registry using OIDC provenance. No manual publish step is required after the tag is pushed.