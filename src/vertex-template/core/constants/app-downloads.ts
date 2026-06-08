const DEFAULT_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL =
  'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.7/AirQo-Vertex-Setup-0.1.7.exe';

export const VERTEX_DESKTOP_DOWNLOADS = {
  windows:
    process.env.NEXT_PUBLIC_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL ||
    DEFAULT_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL,
};
