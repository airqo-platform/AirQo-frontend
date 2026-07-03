import {
  defaultVertexConfig,
  validateVertexConfig,
  type VertexConfigInput,
} from "./core/config/vertex-config";

// Generic IoT defaults. Copy vertex.config.example.ts over this file (or
// edit in place) to brand the app for your organization.
const config: VertexConfigInput = {
  ...defaultVertexConfig,
  org: {
    name: "Vertex Demo",
    shortName: "Vertex",
    slug: "vertex-demo",
    logo: "/images/vertex_logo.svg",
    primaryColor: "#145FFF",
    supportEmail: "support@example.org",
    websiteUrl: "https://example.org",
  },
  api: {
    adapter: "mock",
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    publicMeasurementsBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
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

    appLauncher: false,
    shipping: false,
    networkRequests: false,
  },
  map: {
    defaultCenter: [0.3476, 32.5825],
    defaultZoom: 11,
    tileProvider: "openstreetmap",
  },
  links: {
    docsUrl: "",
    privacyPolicyUrl: "",
    cookiePolicyUrl: process.env.NEXT_PUBLIC_COOKIE_POLICY_URL || "",
    analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL || "",
  },
};

export const vertexConfig = validateVertexConfig(config);
export default vertexConfig;
