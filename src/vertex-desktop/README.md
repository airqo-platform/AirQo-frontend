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

```bash
npm run dist:win
```

Installer output is written to `src/vertex-desktop/release`.

## Runtime env vars

- `VERTEX_DESKTOP_ENV` = `development` or `production`
- `VERTEX_DESKTOP_DEV_URL` = URL to load in dev
- `VERTEX_DESKTOP_PROD_URL` = URL to load in production

## Notes

- `preload/index.ts` exposes `window.vertexDesktop.getAppVersion()`.
- Permission handlers currently allow media and fullscreen only.
- Auto-update hooks are wired; CI release publishing is the next step.
