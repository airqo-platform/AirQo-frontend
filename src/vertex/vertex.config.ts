import {
  defaultVertexConfig,
  validateVertexConfig,
  type VertexConfigInput,
} from "./core/config/vertex-config";
import { resolveApiOrigin } from "./lib/api-routing";
import { getPublicEnv } from "./lib/public-env";

// `next build` runs without the deployment's environment (see lib/public-env.ts),
// so the API origin is only known once the server starts. The build checks the
// rest of this config against a stand-in origin; nothing reads it then.
const apiOrigin =
  process.env.NEXT_PHASE === "phase-production-build"
    ? "https://api-origin.invalid"
    : resolveApiOrigin();

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
    baseUrl: apiOrigin,
    publicMeasurementsBaseUrl: apiOrigin,
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
      getPublicEnv("NEXT_PUBLIC_COOKIE_POLICY_URL") ||
      "https://airqo.net/legal/cookies",
    analyticsUrl:
      getPublicEnv("NEXT_PUBLIC_ANALYTICS_URL") ||
      "https://staging-analytics.airqo.net",
    desktopDownloadUrl:
      getPublicEnv("NEXT_PUBLIC_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL") || "",
  },
};

export const vertexConfig = validateVertexConfig(config);
export default vertexConfig;
