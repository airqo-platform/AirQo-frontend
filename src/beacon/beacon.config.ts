import { brandTitleOf, isSystemGroupTitle, validateBeaconConfig, type BeaconConfigInput } from "./lib/beacon-config"
import { getPublicEnv } from "@/lib/public-env"

/**
 * AirQo's Beacon. The same code is exported as a domain-neutral template
 * (scripts/export-template.mjs), which replaces this file with template/overlay/beacon.config.ts.
 *
 * NEXT_PUBLIC_BEACON_MOCK=true runs Beacon on its own mock backend with the demo sign-in, for local
 * work without the AirQo platform.
 */
const useMock = getPublicEnv("NEXT_PUBLIC_BEACON_MOCK") === "true"

const config: BeaconConfigInput = {
  org: {
    name: "AirQo",
    shortName: "AirQo",
    slug: "airqo",
    logo: "/icons/airqo_logo.svg",
    favicon: "/icons/favicon.ico",
    primaryColor: "#145FFF",
    supportEmail: "support@airqo.net",
    websiteUrl: "https://airqo.net",
  },
  app: {
    name: "Beacon",
    description: "Air quality monitoring dashboard for AirQo",
  },
  api: {
    adapter: useMock ? "mock" : "http",
  },
  auth: {
    provider: useMock ? "none" : "platform",
    systemGroupSlug: "airqo",
    systemGroupLabel: "AirQo",
  },
  hardware: {
    network: "airqo",
    vendor: "AirQo",
    // Mirrors beacon-api's `_resolve_profile_id`
    profileAliases: {
      gas: ["lowcost_gas"],
      lowcost: ["lowcost", "AirQo-v5-DualPM"],
      "airqo-v5-dualpm": ["lowcost", "AirQo-v5-DualPM"],
    },
  },
  features: {
    maintenanceMap: true,
    roadRouting: getPublicEnv("NEXT_PUBLIC_ENABLE_ROAD_ROUTING") === "true",
    reports: true,
    deviceDataAnalysis: true,
    productTours: true,
    feedback: true,
  },
  map: {
    defaultCenter: [0.3476, 32.5825],
    defaultZoom: 7,
    tileProvider: "openstreetmap",
    homeLocation: { latitude: 0.332078, longitude: 32.570473, name: "Head Office (Kampala)" },
    // AirQo's LoRaWAN gateways across Kampala and Greater Central Uganda
    sampleGateways: [
      {
        id: "gw-muk-01",
        name: "Muk Gateway",
        latitude: 0.33415,
        longitude: 32.57028,
        environment: "urban",
        antenna_height_m: 35,
        max_range_km: 5.0,
        inner_strong_radius_km: 2.0,
        eui: "A84041FFFF210001",
        frequency_band: "EU868",
        description: "Altitude: 1195m ASL. High elevation gateway at Makerere University covering Central Kampala & Wandegeya.",
        enabled: true,
      },
      {
        id: "gw-mug-02",
        name: "Gateway at Muganzirwaza",
        latitude: 0.29526,
        longitude: 32.57249,
        environment: "urban",
        antenna_height_m: 30,
        max_range_km: 5.0,
        inner_strong_radius_km: 2.0,
        eui: "A84041FFFF210002",
        frequency_band: "EU868",
        description: "Urban gateway at Muganzirwaza Complex covering Katwe, Kibuye, Ndeeba and South Kampala.",
        enabled: true,
      },
      {
        id: "gw-ggaba-03",
        name: "Gateway at NWSC-Ggaba",
        latitude: 0.25126,
        longitude: 32.63737,
        environment: "suburban",
        antenna_height_m: 30,
        max_range_km: 7.0,
        inner_strong_radius_km: 3.5,
        eui: "A84041FFFF210003",
        frequency_band: "EU868",
        description: "Water treatment plant gateway with clear line-of-sight across Ggaba, Munyonyo and Lake Victoria shore.",
        enabled: true,
      },
      {
        id: "gw-nkozi-04",
        name: "Masaka Nkozi Gateway",
        latitude: 0.00273,
        longitude: 32.01378,
        environment: "rural",
        antenna_height_m: 40,
        max_range_km: 10.0,
        inner_strong_radius_km: 5.0,
        eui: "A84041FFFF210004",
        frequency_band: "EU868",
        description: "Altitude: 1250m ASL. Elevated mast at Uganda Martyrs University Nkozi / Masaka Highway with up to 10 km reach.",
        enabled: true,
      },
      {
        id: "gw-soroti-05",
        name: "Gateway at Soroti",
        latitude: 1.7656607,
        longitude: 33.6272319,
        environment: "rural",
        antenna_height_m: 40,
        max_range_km: 10.0,
        inner_strong_radius_km: 5.0,
        eui: "A84041FFFF210005",
        frequency_band: "EU868",
        description: "Eastern Uganda regional hub gateway in Soroti with open terrain propagation up to 10 km.",
        enabled: true,
      },
    ],
  },
  monitoring: {
    errorReportEndpoint: "/api/slack/notify",
  },
  links: {
    docsUrl: "https://docs.airqo.net/airqo-rest-api-documentation/",
    privacyPolicyUrl: "",
    termsUrl: "",
    deviceManagement: {
      name: "Vertex",
      url: { production: "https://vertex.airqo.net", staging: "https://staging-vertex.airqo.net" },
    },
    organisationAccess: {
      name: "Nexus",
      url: { production: "https://nexus.airqo.net", staging: "https://staging-nexus.airqo.net" },
    },
  },
}

export const beaconConfig = validateBeaconConfig(config)
export default beaconConfig

/** "AirQo Beacon": the organisation's short name and the app name. */
export const brandTitle = brandTitleOf(beaconConfig)

/** How the system group is named in copy. */
export const systemGroupLabel = beaconConfig.auth.systemGroupLabel || beaconConfig.auth.systemGroupSlug

/** Whether a group title is the operator's own ("system") group. */
export const isSystemGroup = (title: string | null | undefined): boolean =>
  isSystemGroupTitle(title, beaconConfig.auth.systemGroupSlug)
