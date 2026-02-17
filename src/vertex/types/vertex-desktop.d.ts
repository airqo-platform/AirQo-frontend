interface VertexDesktopApi {
  getAppVersion: () => Promise<string>;
}

interface Window {
  vertexDesktop?: VertexDesktopApi;
}
