import { session } from "electron";

const WEB_PERMISSION_ALLOWLIST = new Set([
  "media",
  "fullscreen"
]);

export const setupPermissionHandlers = (): void => {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(WEB_PERMISSION_ALLOWLIST.has(permission));
  });

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return WEB_PERMISSION_ALLOWLIST.has(permission);
  });
};
