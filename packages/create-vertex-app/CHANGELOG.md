# @airqo/create-vertex-app - Changelog

> **Note**: This changelog tracks releases of the `@airqo/create-vertex-app` CLI published to npm. The scaffolded app comes from [src/vertex-template](../../src/vertex-template), which is versioned separately — see its own [changelog](../../src/vertex-template/app/changelog.md). A given CLI release ships the template snapshot as of that publish.

## Version 0.1.0
**Released:** Unreleased

### Feature: Initial CLI to Scaffold Vertex Dashboard Apps

First release of `@airqo/create-vertex-app`, a CLI that scaffolds a configurable, mock-first Vertex IoT dashboard (Next.js) in one command. The generated app runs entirely on mock data — no backend, credentials, or `.env` file required — with all branding and feature customization driven by a generated `vertex.config.ts`.

<details>
<summary><strong>New: Interactive & non-interactive scaffolding</strong></summary>

- Interactive prompts (via `@clack/prompts`) for organization name, short name, primary theme color, and map tile provider.
- Non-interactive mode for CI and scripting: `--yes`, `--org-name`, `--short-name`, `--color`, `--tiles openstreetmap|mapbox`, `--git`/`--no-git`.
- Refuses to scaffold into a non-empty directory; optionally initializes a git repository with an initial commit.

</details>

<details>
<summary><strong>New: Bundled template snapshot</strong></summary>

- Ships a snapshot of `src/vertex-template` inside the npm tarball, copied in at publish time by the `prepack` hook (`scripts/sync-template.mjs`), so scaffolding is offline-capable and deterministic.
- The sync excludes build artifacts, lockfiles, and monorepo-only files (`node_modules`, `.next`, `package-lock.json`, `Dockerfile`, `docs`, etc.).
- Stores the template's `.gitignore` as `_gitignore` (npm strips `.gitignore` from published packages); the CLI renames it back when scaffolding.

</details>

<details>
<summary><strong>New: End-to-end smoke test</strong></summary>

- `scripts/smoke-test.mjs` (run via `npm run test:smoke`) syncs the template, builds the CLI, scaffolds a project non-interactively into a temp directory, and asserts the output: expected files present, excluded files absent, and package name / org branding applied to `package.json` and `vertex.config.ts`.

</details>

<details>
<summary><strong>Package configuration</strong></summary>

- Published as `@airqo/create-vertex-app` with public access; `bin` exposes `create-vertex-app`.
- Runtime dependencies kept to two (`@clack/prompts`, `picocolors`) for fast `npx` installs; TypeScript sources bundled to a single ESM file with `tsup` (Node >= 18.18).

</details>

---
