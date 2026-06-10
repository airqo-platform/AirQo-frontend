# Vertex Desktop Wrapper

Thin Electron shell for the Vertex web app (`src/vertex`).

## Goals

- Keep Vertex business logic in web app code.
- Keep desktop-specific code in this folder only.
- Support secure defaults, installers, and auto-updates.

## Local development

1. Install dependencies:

```bash
cd src/vertex-desktop
npm install
```

2. Create local env:

```bash
copy .env.example .env
```

3. Start desktop + web:

```bash
npm run dev
```

This runs:
- Vertex web app from `src/vertex` on `http://localhost:3000`
- Electron shell that loads that URL

## Build installer (Windows)

### Windows prerequisites

Before building on Windows, make sure:

1. Windows Developer Mode is enabled:
   - Settings -> Privacy & security -> For developers -> Developer Mode = On
2. Your terminal is opened as Administrator.

These are required so electron-builder can complete Windows packaging steps (including executable/icon resource updates) without symlink permission errors.

```bash
npm run dist:win
```

Installer output is written to `src/vertex-desktop/release`.

## CI and release workflows

Desktop CI and release are handled by:

- `.github/workflows/vertex-desktop-ci.yml`
- `.github/workflows/vertex-desktop-release.yml`

### Auto-update release flow

1. Bump `version` in `src/vertex-desktop/package.json`.
2. Commit changes.
3. Create and push a release tag (or run release workflow manually with an existing tag):

```bash
git tag vertex-desktop-v0.1.5
git push origin vertex-desktop-v0.1.5
```

4. The `vertex-desktop-release` workflow builds and publishes installers to GitHub Releases for:
- Windows (`nsis`)
- macOS (`dmg`, `zip`)
- Linux (`AppImage`, `deb`)

`electron-updater` consumes these release assets (`latest.yml` + installer) to deliver in-app updates.

### Update behavior

- Windows: auto-update is supported through `electron-updater` + NSIS releases.
- macOS/Linux: release artifacts are published, but update behavior may differ based on platform signing/notarization and feed support.
- If you trigger the workflow manually, `release_tag` must already exist in the repository.

### When to trigger a desktop release

Create a new desktop release tag (`vertex-desktop-v*`) only when the desktop wrapper itself changes, for example:
- `src/vertex-desktop/main/**`, `src/vertex-desktop/preload/**`, menu/deeplink/update behavior
- Desktop packaging/build config, installer behavior, or desktop dependencies
- Desktop-only assets and bundled runtime behavior

Do **not** create a desktop release tag for web-only Vertex changes in `src/vertex/**`.
The desktop app loads the hosted Vertex web app URL at runtime, so normal web deploys are reflected in desktop without shipping a new desktop binary.

## Runtime env vars

- `VERTEX_DESKTOP_ENV` = `development` or `production`
- `VERTEX_DESKTOP_DEV_URL` = URL to load in dev
- `VERTEX_DESKTOP_PROD_URL` = URL to load in production

## Notes

- `preload/index.ts` exposes `window.vertexDesktop.getAppVersion()`.
- Permission handlers currently allow media and fullscreen only.
- Auto-update hooks and CI release publishing are wired via `.github/workflows/vertex-desktop-release.yml`.
- If the hosted Vertex URL is unreachable, the desktop app loads a packaged offline fallback page (`assets/offline.html`) with a retry action.
