import { BrowserWindow, dialog, MessageBoxOptions, MessageBoxReturnValue } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";

let isAutoUpdateSetup = false;
let activeWindow: BrowserWindow | null = null;

const getDialogWindow = (): BrowserWindow | undefined => {
  if (activeWindow && !activeWindow.isDestroyed()) {
    return activeWindow;
  }
  return undefined;
};

const showMessageBoxSafe = async (options: MessageBoxOptions): Promise<MessageBoxReturnValue> => {
  const window = getDialogWindow();
  if (window && !window.isDestroyed()) {
    return dialog.showMessageBox(window, options);
  }
  return dialog.showMessageBox(options);
};

export const setAutoUpdateWindow = (window: BrowserWindow): void => {
  activeWindow = window;
};

export const setupAutoUpdates = (): void => {
  if (isAutoUpdateSetup) {
    return;
  }
  isAutoUpdateSetup = true;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;

  autoUpdater.on("error", (error) => {
    log.error("[updater] failed", error);
  });

  autoUpdater.on("update-available", async () => {
    const window = getDialogWindow();
    if (!window || window.isDestroyed()) return;

    const result = await showMessageBoxSafe({
      type: "info",
      title: "Update available",
      message: "A new version is available. Download now?",
      buttons: ["Download", "Later"],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on("update-downloaded", async () => {
    const window = getDialogWindow();
    if (!window || window.isDestroyed()) return;

    const result = await showMessageBoxSafe({
      type: "info",
      title: "Install update",
      message: "Update downloaded. Restart to install now?",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
};

export const checkForUpdates = async (): Promise<void> => {
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error("[updater] check failed", error);
  }
};
