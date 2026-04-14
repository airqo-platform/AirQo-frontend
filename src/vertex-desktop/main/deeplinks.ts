import { app, BrowserWindow } from "electron";

const PROTOCOL = "vertex";

export const registerDeepLinkProtocol = (): void => {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
};

export const handleDeepLink = (
  mainWindow: BrowserWindow,
  deepLinkUrl: string,
  fallbackBaseUrl: string
): void => {
  if (!deepLinkUrl?.startsWith(`${PROTOCOL}://`)) {
    return;
  }

  try {
    const parsed = new URL(deepLinkUrl);
    const baseOrigin = new URL(fallbackBaseUrl).origin;
    const hostPath = parsed.host ? `/${parsed.host}` : "";
    const path = `${hostPath}${parsed.pathname || "/"}`;
    const search = parsed.search || "";
    const hash = parsed.hash || "";
    mainWindow.loadURL(`${baseOrigin}${path}${search}${hash}`);
  } catch {
    // Ignore invalid deep links.
  }
};
