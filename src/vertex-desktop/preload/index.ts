import { contextBridge, ipcRenderer } from "electron";
import type { VertexDesktopApi } from "./api";

const api: VertexDesktopApi = {
  getAppVersion: async () => ipcRenderer.invoke("vertex-desktop:get-app-version")
};

contextBridge.exposeInMainWorld("vertexDesktop", api);

const TOPBAR_ID = "vertex-desktop-topbar";
const TOPBAR_STYLE_ID = "vertex-desktop-topbar-style";

const updateBackButtonState = (enabled: boolean): void => {
  const backButton = document.getElementById("vertex-desktop-back-button") as HTMLButtonElement | null;
  if (!backButton) return;
  backButton.disabled = !enabled;
};

const syncNavigationState = async (): Promise<void> => {
  const canGoBack = await ipcRenderer.invoke("vertex-desktop:can-go-back");
  updateBackButtonState(Boolean(canGoBack));
};

const injectDesktopTopbar = (): void => {
  if (!document.body || document.getElementById(TOPBAR_ID)) {
    return;
  }

  if (!document.getElementById(TOPBAR_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = TOPBAR_STYLE_ID;
    style.textContent = `
      :root {
        --vertex-titlebar-height: env(titlebar-area-height, 40px);
      }
      html.vertex-desktop-topbar-enabled body {
        margin-top: var(--vertex-titlebar-height) !important;
      }
      html.vertex-desktop-topbar-enabled .fixed.top-0 {
        top: var(--vertex-titlebar-height) !important;
      }
      html.vertex-desktop-topbar-enabled .sticky.top-0 {
        top: var(--vertex-titlebar-height) !important;
      }
      html.vertex-desktop-topbar-enabled .fixed.top-0.h-full {
        height: calc(100% - var(--vertex-titlebar-height)) !important;
      }
      #${TOPBAR_ID} {
        position: fixed;
        top: env(titlebar-area-y, 0px);
        left: env(titlebar-area-x, 0px);
        width: env(titlebar-area-width, 100%);
        height: var(--vertex-titlebar-height);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        background: #0f1115;
        z-index: 2147483647;
        border-bottom: 1px solid #22252d;
        -webkit-app-region: drag;
      }
      #${TOPBAR_ID} .vertex-desktop-nav-btn {
        width: 18px;
        height: 18px;
        border: 0;
        border-radius: 6px;
        background: #20242f;
        color: #e5e7eb;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        -webkit-app-region: no-drag;
      }
      #${TOPBAR_ID} .vertex-desktop-nav-btn:hover:enabled {
        background: #2b3140;
      }
      #${TOPBAR_ID} .vertex-desktop-nav-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      #${TOPBAR_ID} .vertex-desktop-left-controls {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding-right: 14px;
      }
      #${TOPBAR_ID} .vertex-desktop-brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      #${TOPBAR_ID} .vertex-desktop-brand-icon {
        width: 14px;
        height: 14px;
        border-radius: 2px;
        flex-shrink: 0;
      }
      #${TOPBAR_ID} .vertex-desktop-brand-name {
        color: #f3f4f6;
        font-size: 10px;
        letter-spacing: 0.1px;
        white-space: nowrap;
      }
      #${TOPBAR_ID} .vertex-desktop-spacer {
        flex: 1;
      }
      #${TOPBAR_ID} .vertex-desktop-right-safe-area {
        width: 160px;
        height: 100%;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  document.documentElement.classList.add("vertex-desktop-topbar-enabled");

  const topbar = document.createElement("div");
  topbar.id = TOPBAR_ID;
  topbar.innerHTML = `
    <div class="vertex-desktop-left-controls">
      <button id="vertex-desktop-back-button" class="vertex-desktop-nav-btn" aria-label="Go back" title="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
      <button id="vertex-desktop-reload-button" class="vertex-desktop-nav-btn" aria-label="Reload page" title="Reload">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 12A8 8 0 1 1 17.66 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M20 4V10H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
    </div>
    <div class="vertex-desktop-brand" aria-label="Application name">
      <img id="vertex-desktop-brand-icon" class="vertex-desktop-brand-icon" alt="AirQo Vertex" />
      <span id="vertex-desktop-brand-name" class="vertex-desktop-brand-name">AirQo Vertex</span>
    </div>
    <div class="vertex-desktop-spacer"></div>
    <div class="vertex-desktop-right-safe-area"></div>
  `;
  document.body.prepend(topbar);

  const backButton = document.getElementById("vertex-desktop-back-button") as HTMLButtonElement | null;
  const reloadButton = document.getElementById("vertex-desktop-reload-button") as HTMLButtonElement | null;

  backButton?.addEventListener("click", async () => {
    await ipcRenderer.invoke("vertex-desktop:nav-back");
    await syncNavigationState();
  });

  reloadButton?.addEventListener("click", async () => {
    await ipcRenderer.invoke("vertex-desktop:nav-reload");
  });

  void ipcRenderer.invoke("vertex-desktop:get-branding").then((branding: { name?: string; iconDataUrl?: string }) => {
    const nameEl = document.getElementById("vertex-desktop-brand-name");
    const iconEl = document.getElementById("vertex-desktop-brand-icon") as HTMLImageElement | null;
    if (nameEl && branding?.name) {
      nameEl.textContent = branding.name;
      nameEl.setAttribute("title", branding.name);
    }
    if (iconEl && branding?.iconDataUrl) {
      iconEl.src = branding.iconDataUrl;
    }
  });

  void syncNavigationState();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectDesktopTopbar, { once: true });
} else {
  injectDesktopTopbar();
}

ipcRenderer.on("vertex-desktop:navigation-state", (_event, payload: { canGoBack?: boolean }) => {
  updateBackButtonState(Boolean(payload?.canGoBack));
});
