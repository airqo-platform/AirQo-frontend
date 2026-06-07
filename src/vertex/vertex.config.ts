import {
  defaultVertexConfig,
  validateVertexConfig,
  type VertexConfigInput,
} from "./core/config/vertex-config";
import { getDefaultApiUrl } from "./lib/envConstants";

const config: VertexConfigInput = {
  ...defaultVertexConfig,
  org: {
    name: "AirQo Vertex",
    shortName: "AirQo",
    slug: "airqo",
    logo: "/images/airqo_logo.svg",
    primaryColor: "#145FFF",
    supportEmail: "support@airqo.net",
    websiteUrl: "https://airqo.net",
  },
  api: {
    adapter: "airqo",
    baseUrl: process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl(),
    publicMeasurementsBaseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL || getDefaultApiUrl(),
  },
  auth: {
    provider: "airqo",
    systemGroupSlug: "airqo",
  },
  features: {
    deviceMap: true,
    bulkDeploy: true,
    siteManagement: true,
    exportCSV: true,
    readingHistory: false,
    userManagement: false,
    desktopDownload: true,
    appLauncher: true,
    shipping: true,
    networkRequests: true,
  },
  map: {
    defaultCenter: [0.3476, 32.5825],
    defaultZoom: 11,
    tileProvider: "mapbox",
  },
  links: {
    docsUrl: "https://docs.airqo.net",
    privacyPolicyUrl: "https://airqo.net/legal/privacy",
    cookiePolicyUrl:
      process.env.NEXT_PUBLIC_COOKIE_POLICY_URL ||
      "https://airqo.net/legal/cookies",
    analyticsUrl:
      process.env.NEXT_PUBLIC_ANALYTICS_URL ||
      "https://staging-analytics.airqo.net",
    desktopDownloadUrl:
      process.env.NEXT_PUBLIC_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL || "",
  },
};

export const vertexConfig = validateVertexConfig(config);
export default vertexConfig;
