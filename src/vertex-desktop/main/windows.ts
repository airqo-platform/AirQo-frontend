import { BrowserWindow, shell } from "electron";
import path from "node:path";

interface CreateWindowArgs {
  startUrl: string;
  preloadPath: string;
}

export const createMainWindow = ({ startUrl, preloadPath }: CreateWindowArgs): BrowserWindow => {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0b1324",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    },
    icon: path.join(__dirname, "..", "..", "assets", "icon.png")
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
    if (new URL(url).origin !== appOrigin) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  window.loadURL(startUrl);

  return window;
};
