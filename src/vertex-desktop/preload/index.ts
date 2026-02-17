import { contextBridge, ipcRenderer } from "electron";
import type { VertexDesktopApi } from "./api";

const api: VertexDesktopApi = {
  getAppVersion: async () => ipcRenderer.invoke("vertex-desktop:get-app-version")
};

contextBridge.exposeInMainWorld("vertexDesktop", api);
