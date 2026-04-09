interface VertexDesktopApi {
  getAppVersion: () => Promise<string>;
  retryAppLoad: () => Promise<boolean>;
  canGoBack: () => Promise<boolean>;
  navBack: () => Promise<void>;
  navReload: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
}

interface Window {
  vertexDesktop?: VertexDesktopApi;
}
