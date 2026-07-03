import path from "node:path";
import { BrowserWindow, shell } from "electron";
import { handleDeepLink } from "./deeplinks";

export const setupAuthWindowHandler = (
  mainWindow: BrowserWindow,
  startUrl: string
): void => {
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("/users/auth/")) {
      const iconPath = process.env.VERTEX_DESKTOP_ICON_PATH
        ?? path.join(__dirname, "..", "..", "assets", "icon.png");
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 480,
          height: 680,
          autoHideMenuBar: true,
          title: "Sign in to AirQo Vertex",
          icon: iconPath,
          parent: mainWindow,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
          },
        },
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-create-window", (childWindow) => {
    const interceptDeepLink = (event: { preventDefault: () => void }, url: string) => {
      if (!url.startsWith("vertex://")) return;
      event.preventDefault();
      childWindow.destroy();
      if (!mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        handleDeepLink(mainWindow, url, startUrl);
      }
    };

    childWindow.webContents.on("will-navigate", interceptDeepLink);
    childWindow.webContents.on("will-redirect", interceptDeepLink);
  });
};
