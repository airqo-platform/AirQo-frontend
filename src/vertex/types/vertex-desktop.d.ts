interface VertexDesktopApi {
  getAppVersion: () => Promise<string>;
  getBranding: () => Promise<{ name: string; iconDataUrl: string }>;
  retryAppLoad: () => Promise<boolean>;
  canGoBack: () => Promise<boolean>;
  navBack: () => Promise<void>;
  navReload: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setTitleBarColors: (colors: { color: string; symbolColor: string }) => void;
}

interface Window {
  vertexDesktop?: VertexDesktopApi;
}
