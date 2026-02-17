# AirQo Vertex Desktop - Changelog

> **Note**: This changelog tracks desktop wrapper updates for the AirQo Vertex Electron app.

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
