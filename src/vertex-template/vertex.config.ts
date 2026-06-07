import {
  defaultVertexConfig,
  validateVertexConfig,
  type VertexConfigInput,
} from "./core/config/vertex-config";

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
    adapter: "mock",
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    publicMeasurementsBaseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",
  },
  auth: {
    provider: "none",
    systemGroupSlug: "system",
  },
  features: {
    deviceMap: true,
    bulkDeploy: true,
    siteManagement: true,
    exportCSV: true,
    readingHistory: false,
    userManagement: false,

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

  },
};

export const vertexConfig = validateVertexConfig(config);
export default vertexConfig;
