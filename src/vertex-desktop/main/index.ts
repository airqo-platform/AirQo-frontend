import path from "node:path";
import dotenv from "dotenv";
import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import { createMainWindow } from "./windows";
import { setupPermissionHandlers } from "./permissions";
import { setupAutoUpdates, checkForUpdates } from "./updates";
import { registerDeepLinkProtocol, handleDeepLink } from "./deeplinks";
import { setupMenu } from "./menu";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const isDev = process.env.VERTEX_DESKTOP_ENV === "development" || !app.isPackaged;
const devUrl = process.env.VERTEX_DESKTOP_DEV_URL ?? "http://localhost:3000";
const prodUrl = process.env.VERTEX_DESKTOP_PROD_URL ?? "https://vertex.airqo.net";
const startUrl = isDev ? devUrl : prodUrl;

let mainWindow: BrowserWindow | null = null;
const singleInstance = app.requestSingleInstanceLock();

if (!singleInstance) {
  app.quit();
}

const createWindow = (): void => {
  const preloadPath = path.join(__dirname, "..", "preload", "index.js");
  mainWindow = createMainWindow({ startUrl, preloadPath });
  setupAutoUpdates(mainWindow);

  const emitNavigationState = (): void => {
    if (!mainWindow) return;
    mainWindow.webContents.send("vertex-desktop:navigation-state", {
      canGoBack: mainWindow.webContents.canGoBack()
    });
  };

  mainWindow.webContents.on("did-finish-load", emitNavigationState);
  mainWindow.webContents.on("did-navigate", emitNavigationState);
  mainWindow.webContents.on("did-navigate-in-page", emitNavigationState);
};

app.whenReady().then(async () => {
  ipcMain.handle("vertex-desktop:get-app-version", () => app.getVersion());
  ipcMain.handle("vertex-desktop:get-branding", () => {
    const iconPath = path.join(__dirname, "..", "..", "assets", "icon.png");
    const icon = nativeImage.createFromPath(iconPath);
    return {
      name: "AirQo Vertex",
      iconDataUrl: icon.isEmpty() ? "" : icon.toDataURL()
    };
  });
  ipcMain.handle("vertex-desktop:nav-reload", () => {
    if (!mainWindow) return false;
    mainWindow.webContents.reload();
    return true;
  });
  ipcMain.handle("vertex-desktop:nav-back", () => {
    if (!mainWindow) return false;
    if (mainWindow.webContents.canGoBack()) {
      mainWindow.webContents.goBack();
      return true;
    }
    return false;
  });
  ipcMain.handle("vertex-desktop:can-go-back", () => {
    return mainWindow?.webContents.canGoBack() ?? false;
  });
  registerDeepLinkProtocol();
  setupMenu();
  setupPermissionHandlers();
  createWindow();

  if (!isDev) {
    await checkForUpdates();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("open-url", (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    handleDeepLink(mainWindow, url, startUrl);
  }
});

app.on("second-instance", (_event, argv) => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();

  const deepLinkArg = argv.find((item) => item.startsWith("vertex://"));
  if (deepLinkArg) {
    handleDeepLink(mainWindow, deepLinkArg, startUrl);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
