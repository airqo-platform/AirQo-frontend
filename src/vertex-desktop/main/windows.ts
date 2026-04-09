import { BrowserWindow, shell, nativeTheme } from "electron";
import path from "node:path";

interface CreateWindowArgs {
  startUrl: string;
  preloadPath: string;
}

export const createMainWindow = ({ startUrl, preloadPath }: CreateWindowArgs): BrowserWindow => {
  const iconPath = process.env.VERTEX_DESKTOP_ICON_PATH ?? path.join(__dirname, "..", "..", "assets", "icon.png");

  const window = new BrowserWindow({
    title: "AirQo Vertex",
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0b1324",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? "#1d1f20" : "#f3f4f6",
      symbolColor: nativeTheme.shouldUseDarkColors ? "#f8fafc" : "#111827",
      height: 38
    },
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    },
    icon: iconPath
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const appOrigin = new URL(startUrl).origin;
  window.webContents.on("will-navigate", (event, url) => {
    try {
      if (new URL(url).origin !== appOrigin) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch {
      event.preventDefault();
    }
  });

  window.loadURL(startUrl);

  return window;
};
