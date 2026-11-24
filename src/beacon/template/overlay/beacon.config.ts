import { brandTitleOf, isSystemGroupTitle, validateBeaconConfig, type BeaconConfigInput } from "@/lib/beacon-config"

// Generic defaults. Copy beacon.config.example.ts over this file (or edit in place) to brand the
// app for your organization. The schema lives in lib/beacon-config.ts.
const config: BeaconConfigInput = {
  org: {
    name: "Beacon Demo",
    shortName: "Beacon",
    slug: "beacon-demo",
    logo: "/icons/beacon-logo.svg",
    primaryColor: "#145FFF",
    supportEmail: "support@example.org",
    websiteUrl: "",
  },
  app: {
    name: "Beacon",
    description: "Device health monitoring for sensor networks",
  },
  api: {
    // "mock" serves the demo fleet from this app; "http" calls a real Beacon API and platform API
    // at NEXT_PUBLIC_BEACON_API_URL and NEXT_PUBLIC_PLATFORM_API_URL.
    adapter: process.env.NEXT_PUBLIC_API_ADAPTER === "http" ? "http" : "mock",
  },
  auth: {
    provider: "none",
    systemGroupSlug: "system",
    systemGroupLabel: "System",
  },
  hardware: {
    network: "",
    vendor: "",
    profileAliases: {
      gas: ["lowcost_gas"],
    },
  },
  features: {
    maintenanceMap: true,
    roadRouting: process.env.NEXT_PUBLIC_ENABLE_ROAD_ROUTING === "true",
    reports: true,
    deviceDataAnalysis: true,
    productTours: true,
    feedback: true,
  },
  map: {
    defaultCenter: [0.3476, 32.5825],
    defaultZoom: 7,
    tileProvider: "openstreetmap",
    sampleGateways: [],
  },
  monitoring: {
    errorReportEndpoint: "",
  },
  links: {
    docsUrl: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    deviceManagement: { name: "", url: "" },
    organisationAccess: { name: "", url: "" },
  },
}

export const beaconConfig = validateBeaconConfig(config)
export default beaconConfig

/** "Riverside Beacon": the organisation's short name and the app name. */
export const brandTitle = brandTitleOf(beaconConfig)

/** How the system group is named in copy. */
export const systemGroupLabel = beaconConfig.auth.systemGroupLabel || beaconConfig.auth.systemGroupSlug

/** Whether a group title is the operator's own ("system") group. */
export const isSystemGroup = (title: string | null | undefined): boolean =>
  isSystemGroupTitle(title, beaconConfig.auth.systemGroupSlug)
