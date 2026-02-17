export interface VertexDesktopApi {
  getAppVersion: () => Promise<string>;
  retryAppLoad: () => Promise<boolean>;
}
