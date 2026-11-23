/**
 * Annotated reference for beacon.config.ts. Copy the parts you need over beacon.config.ts.
 * The schema lives in lib/beacon-config.ts and is checked at startup: a bad value stops the app
 * with a message naming the key.
 */
import { validateBeaconConfig, type BeaconConfigInput } from "@/lib/beacon-config"

const config: BeaconConfigInput = {
  org: {
    // Full name: page titles, the sign-in page, report headers
    name: "Riverside Air Monitoring Network",
    // Short name: top bar, PDF footers. "Riverside" + app name "Beacon" titles pages "Riverside Beacon".
    shortName: "Riverside",
    // Lowercase letters, numbers and hyphens. Prefixes exported file names and log entries.
    slug: "riverside-air",
    // Path under public/. SVG or PNG, any aspect ratio.
    logo: "/icons/beacon-logo.svg",
    // Optional; defaults to the logo
    favicon: "/icons/beacon-logo.svg",
    // Default primary colour (buttons, links, charts). #RGB or #RRGGBB.
    primaryColor: "#0F766E",
    // Shown on the sign-in page
    supportEmail: "sensors@riverside.example.org",
    // Optional; "" hides it
    websiteUrl: "https://riverside.example.org",
  },
  app: {
    // Product name next to the logo and in copy. Lowercased, it's the analytics app name.
    name: "Beacon",
    // Sign-in subtitle and page metadata
    description: "Device health monitoring for the Riverside sensor network",
  },
  api: {
    // "mock": the demo fleet this app serves itself (lib/mock/).
    // "http": a real Beacon API and platform API at NEXT_PUBLIC_BEACON_API_URL and
    //         NEXT_PUBLIC_PLATFORM_API_URL (lib/integration/api-urls.js). They must implement the
    //         same endpoints the mock does; tests/unit/mock lists them.
    adapter: "mock",
  },
  auth: {
    // "none": everyone is signed in as the demo user (lib/mock/identity.ts). Add a real provider
    // in lib/integration/auth.ts.
    provider: "none",
    // Group title of your own organisation. Its admins get the administrative panel, fleet-wide
    // diagnostics and "My Devices". Must match a group title your platform API returns.
    systemGroupSlug: "system",
    // How that group is named in copy
    systemGroupLabel: "Riverside",
  },
  hardware: {
    // Manufacturer key of your own devices: device lists open filtered to it. "" for no filter.
    network: "",
    // Vendor prefilled when registering a device profile
    vendor: "",
    // Profile names some device categories use, as your Beacon API resolves them
    profileAliases: { gas: ["lowcost_gas"] },
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
    // [latitude, longitude]. The demo fleet and generated LoRaWAN gateways are placed around it.
    defaultCenter: [0.3476, 32.5825],
    defaultZoom: 7,
    // "openstreetmap" (no token needed)
    tileProvider: "openstreetmap",
    // Where maintenance routes start; defaults to the map centre
    homeLocation: { latitude: 0.33, longitude: 32.57, name: "Riverside depot" },
    // Your LoRaWAN gateways; [] generates samples around the map centre
    sampleGateways: [],
  },
  monitoring: {
    // Same-origin route that receives client error reports (POST { level, message, context }).
    // "" logs them to the browser console instead.
    errorReportEndpoint: "",
  },
  links: {
    // Each "" hides the link or prompt that uses it
    docsUrl: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    // Where devices are added: "Add a device in {name}" on Home and empty device lists.
    // Links to {url}/devices/my-devices and {url}/devices/overview. The URL can also be
    // { production: "...", staging: "..." } to follow the environment.
    deviceManagement: { name: "", url: "" },
    // Where people ask to join an organisation: the organisation switcher and Home.
    // Links to {url} and {url}/request-organization.
    organisationAccess: { name: "", url: "" },
  },
}

export default validateBeaconConfig(config)
