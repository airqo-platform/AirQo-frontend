import {
  defaultVertexConfig,
  validateVertexConfig,
  type VertexConfigInput,
} from "./core/config/vertex-config";

const config: VertexConfigInput = {
  ...defaultVertexConfig,
  org: {
    name: "KCCA Air Quality",
    shortName: "KCCA",
    slug: "kcca-air",
    logo: "/logo.png",
    primaryColor: "#00A86B",
    supportEmail: "support@kcca.go.ug",
    websiteUrl: "https://www.kcca.go.ug",
  },
  api: {
    adapter: "mock",
    baseUrl: "",
    publicMeasurementsBaseUrl: "",
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
    desktopDownload: false,
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
    cookiePolicyUrl: "",
    analyticsUrl: "",
    desktopDownloadUrl: "",
  },
};

export const vertexConfig = validateVertexConfig(config);
export default vertexConfig;
