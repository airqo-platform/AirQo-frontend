import {
  defaultBeaconConfig,
  isSystemGroupTitle,
  validateBeaconConfig,
  type BeaconConfigInput,
} from "./lib/beacon-config"

// Generic defaults. Copy beacon.config.example.ts over this file (or edit in
// place) to brand the app for your organization.
const config: BeaconConfigInput = {
  ...defaultBeaconConfig,
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
    adapter: "mock",
  },
  auth: {
    provider: "none",
    systemGroupSlug: "system",
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
  },
  links: {
    docsUrl: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    deviceManagementUrl: "",
    organisationAccessUrl: "",
  },
}

export const beaconConfig = validateBeaconConfig(config)
export default beaconConfig

/**
 * "Riverside Beacon": the organisation's short name and the app name, used for page titles and
 * report headers. Just the app name when the two are the same.
 */
export const brandTitle =
  beaconConfig.org.shortName.trim().toLowerCase() === beaconConfig.app.name.trim().toLowerCase()
    ? beaconConfig.app.name
    : `${beaconConfig.org.shortName} ${beaconConfig.app.name}`

/** Whether a group title is the operator's own ("system") group. */
export const isSystemGroup = (title: string | null | undefined): boolean =>
  isSystemGroupTitle(title, beaconConfig.auth.systemGroupSlug)
