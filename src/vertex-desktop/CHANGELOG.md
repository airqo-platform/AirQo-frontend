# AirQo Vertex Desktop - Changelog

> **Note**: This changelog tracks desktop wrapper updates for the AirQo Vertex Electron app.

---

## Version 0.1.11
**Released:** July 06, 2026

### Social OAuth in Electron Window

Replaced system-browser OAuth flow with a dedicated Electron child window so the OS no longer shows a "Open Electron?" protocol dialog and the browser tab is never left in a broken state.

<details>
<summary><strong>Authentication (3)</strong></summary>

- **OAuth Child Window**: Social sign-in URLs (`/users/auth/*`) now open in a 480×680 Electron `BrowserWindow` instead of the system browser, keeping the entire auth flow inside the app.
- **Deep-Link Interception**: The child window monitors `will-navigate` and `will-redirect` for the `vertex://` redirect issued by the backend after OAuth completes; it intercepts the URL internally, closes itself, and hands the token to `handleDeepLink` — no OS protocol handler required.
- **AirQo Icon**: The auth popup uses the same packaged `icon.png` as the main window instead of the default Electron icon.

</details>

<details>
<summary><strong>Files Added/Modified (3)</strong></summary>

- `main/auth-window.ts` *(new)*
- `main/index.ts`
- `main/windows.ts`

</details>

---

## Version 0.1.10
**Released:** July 05, 2026

### Fully Automated Tag-and-Release Pipeline + Linux Builds

Removed the last manual step from cutting a desktop release: bumping `version` and merging to `staging` now tags and releases automatically. Added Linux packaging so installers publish for all three desktop platforms.

<details>
<summary><strong>CI/CD Enhancements (4)</strong></summary>

- **Auto-Tag Job**: Added an `auto-tag` job to `vertex-desktop-ci.yml` that runs after typecheck/build succeed on `staging`. It reads `version` from `package.json` and, if a matching `vertex-desktop-v<version>` tag doesn't exist yet, creates and pushes it — no local `git tag`/`git push` required.
- **Version-Bump Guard**: `auto-tag` only tags when the push's diff actually changed the `version` field in `package.json`, preventing an unrelated push from re-cutting a release if a tag is ever missing (e.g. deleted).
- **Explicit Node Setup**: `auto-tag` now sets up Node via `actions/setup-node@v4` instead of relying on the runner's preinstalled version, matching the other desktop jobs.
- **Linux Release Job**: Added a `release-linux` job to `vertex-desktop-release.yml` that builds and publishes Linux artifacts alongside the existing Windows and macOS jobs.

</details>

<details>
<summary><strong>Packaging & Distribution (2)</strong></summary>

- **Linux Build Targets**: Configured `build.linux.target` (`AppImage`, `deb`) in `package.json` so `electron-builder --linux` has explicit output targets.
- **Maintainer Email**: Set `author` to an email-bearing value so `electron-builder` can generate valid Debian package metadata for the `deb` target.

</details>

<details>
<summary><strong>Security (1)</strong></summary>

- **Scoped Permissions**: Reduced workflow-level `permissions` in `vertex-desktop-ci.yml` to `contents: read`, since only the `auto-tag` job needs write access (declared at the job level) and the `desktop-quality` job runs untrusted dependency install/build steps.

</details>

<details>
<summary><strong>Documentation (1)</strong></summary>

- **Release Runbook**: Updated desktop README to describe the auto-tag flow and confirm Linux is part of the standard release.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `.github/workflows/vertex-desktop-ci.yml`
- `.github/workflows/vertex-desktop-release.yml`
- `package.json`
- `README.md`

</details>

---

## Version 0.1.6
**Released:** April 09, 2026

### Title Bar Overlay Styling + Branding Bridge

Aligned the native caption button area with the custom title bar styling and exposed branding details to the renderer.

<details>
<summary><strong>Desktop UI Enhancements (4)</strong></summary>

- **Transparent Caption Area**: Made the Windows title bar overlay background transparent so the custom title bar background shows through.
- **Overlay Height Tuning**: Adjusted overlay height to avoid visual seams with the custom title bar.
- **Branding Bridge**: Exposed a `getBranding()` API so the renderer can pull the packaged app icon.
- **Renderer-Native Title Bar Sync**: Updated the preload bridge to broadcast navigation state changes for the React title bar.

</details>

<details>
<summary><strong>IPC Extensions (2)</strong></summary>

- **Title Bar Color Sync**: Added `set-titlebar-colors` to update overlay colors from the renderer when theme changes.
- **Expanded Desktop Bridge**: Added navigation helpers (`canGoBack`, `navBack`, `navReload`) to the preload API.

</details>

<details>
<summary><strong>Packaging & Distribution (4)</strong></summary>

- **macOS Build Support**: Added mac build targets with hardened runtime (notarization driven by env vars when enabled).
- **Entitlements File**: Added macOS entitlements for signed builds (allow-jit only).
- **Publish Script**: Added combined Windows + mac publish script for release automation.
- **Windows-Only CI Release**: Temporarily scoped release workflow to Windows artifacts while macOS is deferred.

</details>

<details>
<summary><strong>Files Modified (6)</strong></summary>

- `main/index.ts`
- `main/windows.ts`
- `preload/index.ts`
- `preload/api.ts`
- `package.json`
- `assets/entitlements.mac.plist`

</details>

---

## Version 0.1.5
**Released:** February 17, 2026

### CI Automation and Release Pipeline for Auto-Updates

Added dedicated desktop CI and tag-based release workflows to automatically publish Windows updater artifacts to GitHub Releases.

<details>
<summary><strong>CI/CD Enhancements (3)</strong></summary>

- **Desktop CI Workflow**: Added a dedicated desktop workflow to run install, typecheck, and build validation for `src/vertex-desktop` changes.
- **Tag-Based Release Workflow**: Added Windows release automation for tags matching `vertex-desktop-v*` with optional manual dispatch support.
- **Auto-Update Artifact Publishing**: Configured release workflow to publish `electron-builder` outputs (`latest.yml` + installer artifacts) required by `electron-updater`.

</details>

<details>
<summary><strong>Documentation (1)</strong></summary>

- **Release Runbook**: Updated desktop README with CI workflow references and step-by-step tag-based release instructions.

</details>

<details>
<summary><strong>Files Added/Modified (3)</strong></summary>

- `.github/workflows/vertex-desktop-ci.yml`
- `.github/workflows/vertex-desktop-release.yml`
- `README.md`

</details>

---

## Version 0.1.4
**Released:** February 17, 2026

### Offline Fallback, Updater Safety, and Navigation Hardening

Improved resilience in installed desktop builds with a packaged offline experience and safer updater/navigation behavior.

<details>
<summary><strong>Offline Experience (2)</strong></summary>

- **Packaged Offline Page**: Added a local offline fallback page that loads when the hosted Vertex app is unreachable.
- **Retry Flow**: Added explicit retry handling (button + online event) to return users from offline screen to the live app.

</details>

<details>
<summary><strong>Updater Robustness (2)</strong></summary>

- **Single Listener Registration**: Prevented duplicate `autoUpdater` listener registration across macOS window re-creation.
- **Destroyed Window Guard**: Added safe dialog guards to avoid showing update dialogs against invalid/destroyed windows.

</details>

<details>
<summary><strong>Security & Stability (2)</strong></summary>

- **Navigation Parse Guard**: Hardened `will-navigate` URL parsing with `try/catch` and default deny behavior on malformed URLs.
- **Stable Layout Hooks**: Updated desktop CSS targeting to use stable `data-vertex-*` hooks (with fallback support for older deployments).

</details>

<details>
<summary><strong>Files Modified (7)</strong></summary>

- `main/index.ts`
- `main/updates.ts`
- `main/windows.ts`
- `preload/index.ts`
- `preload/api.ts`
- `assets/offline.html`
- `README.md`

</details>

---

## Version 0.1.3
**Released:** February 17, 2026

### Title Bar Controls, Branding, and Layout Stability

Added native-style title bar controls and branding, and fixed production layout overlap issues in installed builds.

<details>
<summary><strong>Desktop UI Enhancements (3)</strong></summary>

- **Title Bar Navigation**: Added Back and Reload controls in the desktop title bar overlay.
- **App Branding in Title Bar**: Added app icon and app name ("AirQo Vertex") next to title bar controls.
- **Navigation State Sync**: Back button state now updates based on navigation history.

</details>

<details>
<summary><strong>Production Layout Fixes (2)</strong></summary>

- **Top Offset Injection**: Added desktop offset handling to prevent app headers from rendering under the native title bar.
- **Sidebar/Main Fallback Rules**: Added production-safe fallback CSS rules for current hosted Vertex selectors to keep sidebars and content aligned in installed mode.

</details>

<details>
<summary><strong>Packaging & Runtime Updates (3)</strong></summary>

- **Windows Shortcut Support**: Configured installer shortcuts for Start Menu and Desktop.
- **Asset Packaging**: Added `extraResources` so icon assets are shipped in installed builds.
- **Runtime Asset Resolution**: Updated icon path resolution to use `process.resourcesPath` in packaged apps.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `main/index.ts`
- `main/windows.ts`
- `preload/index.ts`
- `package.json`
- `README.md`

</details>

---

## Version 0.1.2
**Released:** February 17, 2026

### Initial Electron Wrapper Setup

Bootstrapped the desktop wrapper with secure defaults, update hooks, and a minimal preload bridge.

<details>
<summary><strong>Core Setup (4)</strong></summary>

- **Electron Scaffold**: Added `main` and `preload` process structure for desktop runtime.
- **Security Defaults**: Enabled `contextIsolation`, disabled `nodeIntegration`, and enabled renderer sandbox.
- **Auto-Update Hooks**: Added updater setup and check flow scaffolding.
- **Deep Link Skeleton**: Added protocol registration and deep-link handler structure.

</details>

<details>
<summary><strong>Developer Experience (3)</strong></summary>

- **Dev Workflow Scripts**: Added scripts to run Vertex web app and Electron wrapper together.
- **Environment Template**: Added `.env.example` with desktop runtime URLs.
- **Desktop Bridge Typing**: Added typed `window.vertexDesktop` interface for optional desktop-only APIs.

</details>

<details>
<summary><strong>Files Added (11)</strong></summary>

- `main/index.ts`
- `main/windows.ts`
- `main/permissions.ts`
- `main/updates.ts`
- `main/deeplinks.ts`
- `main/menu.ts`
- `preload/index.ts`
- `preload/api.ts`
- `package.json`
- `tsconfig.json`
- `.env.example`

</details>

---

## Version 0.1.1
**Released:** February 17, 2026

### Windows Installer Baseline

Prepared first installable Windows build configuration for the desktop wrapper.

<details>
<summary><strong>Installer Baseline (2)</strong></summary>

- **NSIS Target**: Added Windows installer target and output configuration.
- **Desktop Metadata**: Added app identity metadata and initial release packaging structure.

</details>
