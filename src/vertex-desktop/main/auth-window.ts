import path from "node:path";
import { BrowserWindow, shell } from "electron";
import { handleDeepLink } from "./deeplinks";

const resolveApiOrigin = (): string | null => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  try {
    return raw ? new URL(raw).origin : null;
  } catch {
    return null;
  }
};

const isOAuthUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const apiOrigin = resolveApiOrigin();
    const trustedOrigin = apiOrigin
      ? parsed.origin === apiOrigin
      : parsed.hostname === "airqo.net" || parsed.hostname.endsWith(".airqo.net");
    return trustedOrigin && parsed.pathname.startsWith("/users/auth/");
  } catch {
    return false;
  }
};

export const setupAuthWindowHandler = (
  mainWindow: BrowserWindow,
  startUrl: string
): void => {
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isOAuthUrl(url)) {
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
    shell.openExternal(url).catch(() => { /* no-op: best-effort external open */ });
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-create-window", (childWindow) => {
    childWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url).catch(() => {});
      return { action: "deny" };
    });

    const interceptDeepLink = (event: { preventDefault: () => void }, url: string) => {
      if (!url.startsWith("vertex://login")) return;
      event.preventDefault();
      childWindow.webContents.off("will-navigate", interceptDeepLink);
      childWindow.webContents.off("will-redirect", interceptDeepLink);
      if (!childWindow.isDestroyed()) {
        childWindow.destroy();
      }
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
