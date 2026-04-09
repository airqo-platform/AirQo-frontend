import { contextBridge, ipcRenderer } from "electron";
import type { VertexDesktopApi } from "./api";

const api: VertexDesktopApi = {
  getAppVersion: async () => ipcRenderer.invoke("vertex-desktop:get-app-version"),
  getBranding: async () => ipcRenderer.invoke("vertex-desktop:get-branding"),
  retryAppLoad: async () => ipcRenderer.invoke("vertex-desktop:retry-app-load"),
  canGoBack: async () => ipcRenderer.invoke("vertex-desktop:can-go-back"),
  navBack: async () => { await ipcRenderer.invoke("vertex-desktop:nav-back"); },
  navReload: async () => { await ipcRenderer.invoke("vertex-desktop:nav-reload"); },
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.send("vertex-desktop:set-theme", theme),
};

contextBridge.exposeInMainWorld("vertexDesktop", api);


// ─── Layout offset ────────────────────────────────────────────────────────────
// Set a CSS variable on <html> so the web app's own header and sidebars know
// to sit 38px below the top (matching the DesktopTitleBar React component
// height AND the titleBarOverlay height in windows.ts).
const TITLEBAR_HEIGHT = 38;

const applyDesktopStyles = (): void => {
  if (!window.location.protocol.startsWith("http")) return;

  document.documentElement.style.setProperty(
    "--vertex-ui-top-offset",
    `${TITLEBAR_HEIGHT}px`
  );
  document.documentElement.classList.add("vertex-desktop-enabled");

  // Dispatch a custom event each time navigation completes so the
  // DesktopTitleBar React component can re-check canGoBack().
  const dispatchNavigated = () => {
    window.dispatchEvent(new CustomEvent("vertex-desktop:navigated"));
  };

  ipcRenderer.on("vertex-desktop:navigation-state", dispatchNavigated);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyDesktopStyles, { once: true });
} else {
  applyDesktopStyles();
}

// ─── Offline page actions ─────────────────────────────────────────────────────
const wireOfflinePageActions = (): void => {
  const isOfflinePage =
    window.location.protocol === "file:" &&
    window.location.pathname.endsWith("offline.html");
  if (!isOfflinePage) return;

  const retryButton = document.getElementById("retry-connection");
  retryButton?.addEventListener("click", async () => {
    await ipcRenderer.invoke("vertex-desktop:retry-app-load");
  });

  window.addEventListener("online", async () => {
    await ipcRenderer.invoke("vertex-desktop:retry-app-load");
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireOfflinePageActions, { once: true });
} else {
  wireOfflinePageActions();
}
