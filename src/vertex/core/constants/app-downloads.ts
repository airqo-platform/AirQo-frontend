export interface DesktopReleaseUrls {
  version: string
  windows: { exe: string | null }
  mac: {
    arm64Dmg: string | null
    arm64Zip: string | null
    intelDmg: string | null
    intelZip: string | null
  }
  linux: {
    appImage: string | null
    deb: string | null
  }
}

export const VERTEX_DESKTOP_DOWNLOAD_FALLBACKS: DesktopReleaseUrls = {
  version: 'v0.1.11',
  windows: {
    exe: 'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/AirQo-Vertex-Setup-0.1.11.exe',
  },
  mac: {
    arm64Dmg:
      'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/AirQo-Vertex-0.1.11-arm64.dmg',
    arm64Zip:
      'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/AirQo-Vertex-0.1.11-arm64-mac.zip',
    intelDmg:
      'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/AirQo-Vertex-0.1.11.dmg',
    intelZip:
      'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/AirQo-Vertex-0.1.11-mac.zip',
  },
  linux: {
    appImage:
      'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/AirQo-Vertex-0.1.11.AppImage',
    deb: 'https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.11/vertex-desktop_0.1.11_amd64.deb',
  },
}

export const LINUX_INSTALL_COMMAND = 'curl -fsSL https://vertex.airqo.net/install.sh | bash'
