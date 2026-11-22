/**
 * Annotated reference for beacon.config.ts. Copy the parts you need over beacon.config.ts.
 * The schema lives in lib/beacon-config.ts and is checked at startup: a bad value stops the app
 * with a message naming the key.
 */
import { validateBeaconConfig, type BeaconConfigInput } from "./lib/beacon-config"

const config: BeaconConfigInput = {
  org: {
    // Full name: page titles, the sign-in page, report headers
    name: "Riverside Air Monitoring Network",
    // Short name: top bar, PDF footers
    shortName: "Riverside",
    // Lowercase letters, numbers and hyphens. Also the analytics app name.
    slug: "riverside-air",
    // Path under public/. SVG or PNG; any aspect ratio. Also used as the favicon.
    logo: "/icons/beacon-logo.svg",
    // Default primary colour (buttons, links, charts). #RGB or #RRGGBB.
    primaryColor: "#0F766E",
    // Shown on the sign-in page
    supportEmail: "sensors@riverside.example.org",
    // Optional; "" hides it
    websiteUrl: "https://riverside.example.org",
  },
  app: {
    // Product name next to the logo and in copy ("Explore Beacon", "Beacon received no data...")
    name: "Beacon",
    // Sign-in subtitle and page metadata
    description: "Device health monitoring for the Riverside sensor network",
  },
  api: {
    // v1: "mock" only. The app serves its own mock backend at /api/mock/* (see lib/mock/).
    adapter: "mock",
  },
  auth: {
    // v1: "none" only. Everyone is signed in as the demo user (lib/mock/identity.ts).
    provider: "none",
    // Group title of the operator's own organisation. Its admins get the administrative panel,
    // fleet-wide diagnostics and "My Devices". Must match a group title in your data.
    systemGroupSlug: "system",
  },
  features: {
    // Maintenance route planning on a map (nav entry, Home card, route)
    maintenanceMap: true,
    // Route along roads with OSRM instead of straight lines. Sends stop coordinates to OSRM
    // (NEXT_PUBLIC_OSRM_BASE_URL, default: the public demo server, which is rate-limited).
    roadRouting: false,
    // Device health reports (PDF/CSV)
    reports: true,
    // Device Data Analysis in the administrative panel: chart an uploaded CSV in the browser
    deviceDataAnalysis: true,
    // Guided tours: automatic on first visit, and "Take a tour of this page" in the help menu
    productTours: true,
    // Feedback launcher, page satisfaction banner and the post-sign-in rating prompt
    feedback: true,
  },
  map: {
    // [latitude, longitude]. The demo fleet and sample LoRaWAN gateways are placed around it.
    defaultCenter: [0.3476, 32.5825],
    defaultZoom: 7,
    // v1: "openstreetmap" only (no token needed)
    tileProvider: "openstreetmap",
  },
  links: {
    // Each "" hides the link or prompt that uses it
    docsUrl: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    // Where devices are added and deployed: "Add a device" prompts on Home and empty device lists.
    // The app links to {url}/devices/my-devices and {url}/devices/overview.
    deviceManagementUrl: "",
    // Where people ask to join an organisation: the organisation switcher and Home.
    // The app links to {url} and {url}/request-organization.
    organisationAccessUrl: "",
  },
}

export default validateBeaconConfig(config)
