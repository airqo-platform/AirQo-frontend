import { BrowserWindow, dialog } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";

export const setupAutoUpdates = (window: BrowserWindow): void => {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;

  autoUpdater.on("error", (error) => {
    log.error("[updater] failed", error);
  });

  autoUpdater.on("update-available", async () => {
    const result = await dialog.showMessageBox(window, {
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
    const result = await dialog.showMessageBox(window, {
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
