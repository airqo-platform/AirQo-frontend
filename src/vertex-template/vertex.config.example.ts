/**
 * Annotated reference configuration for a Vertex app.
 *
 * Copy this file over vertex.config.ts (or edit that file in place) to
 * brand and configure your deployment. Every key shown here exists in
 * the zod schema in core/config/vertex-config.ts — the app validates
 * the config at startup and fails fast with a readable error.
 *
 * This example configures a fictional city air-quality program to show
 * what a branded deployment looks like; the shipped vertex.config.ts
 * uses neutral demo values.
 */
import {
  defaultVertexConfig,
  validateVertexConfig,
  type VertexConfigInput,
} from "./core/config/vertex-config";

const config: VertexConfigInput = {
  ...defaultVertexConfig,

  org: {
    // Full organization name: page titles, footer, metadata.
    name: "KCCA Air Quality",
    // Short name: compact UI spots (feedback prompts, buttons).
    shortName: "KCCA",
    // Lowercase kebab-case identifier for this deployment.
    slug: "kcca-air",
    // Logo path under public/. Swap in your own asset.
    logo: "/images/vertex_logo.svg",
    // Hex theme color driving the UI accent palette.
    primaryColor: "#00A86B",
    // Shown in support links (e.g. the not-found page).
    supportEmail: "support@kcca.go.ug",
    // Optional; used in page metadata. Empty string to omit.
    websiteUrl: "https://www.kcca.go.ug",
  },

  api: {
    // Data source. v1 supports "mock" only: the app runs entirely on
    // fixtures in core/adapters/mock-fixtures.ts, no credentials needed.
    adapter: "mock",
    // Reserved for future real adapters. Safe to leave empty in v1.
    baseUrl: "",
    // Public API origin shown in the copy-paste "Measurements API"
    // example cards. Empty string shows a placeholder origin.
    publicMeasurementsBaseUrl: "",
  },

  auth: {
    // v1 supports "none" only: the app boots straight into the
    // dashboard with a synthetic session for the mock user.
    provider: "none",
    // Group title treated as the operator's own "system" organization.
    // Members of this group get the internal/staff experience
    // (unscoped listings, personal workspace semantics).
    systemGroupSlug: "system",
  },

  features: {
    // Core feature flags — hide or show whole surfaces.
    deviceMap: true,
    bulkDeploy: true,
    siteManagement: true,
    exportCSV: true,
    readingHistory: false,
    userManagement: false,

    // Operator-specific surfaces, off by default in the template.
    appLauncher: false,
    networkRequests: false,
  },

  map: {
    // [latitude, longitude] the map centers on before any data loads.
    defaultCenter: [0.3476, 32.5825],
    // 0 (world) to 22 (building level).
    defaultZoom: 11,
    // "openstreetmap" needs no token; "mapbox" requires
    // NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in the environment.
    tileProvider: "openstreetmap",
  },

  links: {
    // All optional. Empty string hides the corresponding link.
    docsUrl: "",
    privacyPolicyUrl: "",
    cookiePolicyUrl: "",
    analyticsUrl: "",
  },
};

export const vertexConfig = validateVertexConfig(config);
export default vertexConfig;
