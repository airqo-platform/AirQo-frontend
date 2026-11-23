import { z } from "zod"

/**
 * Schema for beacon.config.ts. Beacon and the template exported from it (scripts/export-template.mjs)
 * share this code; only the values in beacon.config.ts differ.
 */

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}){1,2}$/

/**
 * Where data comes from:
 * - "http": the Beacon API and the platform API over HTTP; base URLs from lib/integration/api-urls.js
 * - "mock": the mock backend this app serves itself (app/api/mock, lib/mock)
 */
const adapterSchema = z.enum(["http", "mock"])

/**
 * How people sign in:
 * - "platform": the platform API's user service (lib/integration/auth.ts)
 * - "none": everyone is the demo user (lib/mock/identity.ts)
 */
const authProviderSchema = z.enum(["platform", "none"])

const mapTileProviderSchema = z.enum(["openstreetmap"])

const nonEmptyString = (fieldName: string) => z.string().trim().min(1, `${fieldName} is required`)

const optionalUrl = z.string().url().optional().or(z.literal(""))

/** A URL, or one per environment when staging uses different companion apps from production. */
const environmentUrl = z.union([optionalUrl, z.object({ production: optionalUrl, staging: optionalUrl })])

const companionAppSchema = z.object({
  /** Shown in prompts ("Add a device in {name}"); empty for generic wording. */
  name: z.string().trim(),
  /** Empty hides every prompt that links to the app. */
  url: environmentUrl,
})

const coordinates = z
  .tuple([z.number(), z.number()])
  .refine(([latitude]) => latitude >= -90 && latitude <= 90, "Latitude must be between -90 and 90")
  .refine(([, longitude]) => longitude >= -180 && longitude <= 180, "Longitude must be between -180 and 180")

const gatewaySchema = z.object({
  id: nonEmptyString("Gateway id"),
  name: nonEmptyString("Gateway name"),
  latitude: z.number(),
  longitude: z.number(),
  environment: z.enum(["urban", "suburban", "rural"]),
  antenna_height_m: z.number(),
  max_range_km: z.number(),
  inner_strong_radius_km: z.number(),
  eui: z.string(),
  frequency_band: z.string(),
  description: z.string(),
  enabled: z.boolean(),
})

const beaconConfigSchema = z.object({
  org: z.object({
    /** Full name: page titles, the sign-in page, report headers. */
    name: nonEmptyString("Organization name"),
    /** Short name: top bar, PDF footers, file names' context. */
    shortName: nonEmptyString("Organization short name"),
    /** Lowercase letters, numbers and hyphens; prefixes exported file names. */
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Organization slug must use lowercase letters, numbers, and hyphens"),
    /** Path under public/. */
    logo: nonEmptyString("Organization logo"),
    /** Path under public/; defaults to the logo. */
    favicon: z.string().trim().optional(),
    primaryColor: z.string().trim().regex(HEX_COLOR_PATTERN, "Primary color must be a valid hex color"),
    supportEmail: z.string().trim().email("Support email must be valid"),
    websiteUrl: optionalUrl,
  }),
  app: z.object({
    /** Product name next to the logo and in copy. Lowercased, it's also the analytics app name. */
    name: nonEmptyString("App name"),
    description: z.string().trim(),
  }),
  api: z.object({
    adapter: adapterSchema,
  }),
  auth: z.object({
    provider: authProviderSchema,
    /**
     * Group title of the operator's own organisation. Its admins get the administrative panel,
     * fleet-wide diagnostics and personal devices.
     */
    systemGroupSlug: z.string().trim().min(1),
    /** How the system group is named in copy; defaults to the slug. */
    systemGroupLabel: z.string().trim().optional(),
  }),
  hardware: z.object({
    /** Manufacturer key of the operator's own devices; device lists open filtered to it. Empty for none. */
    network: z.string().trim(),
    /** Vendor name prefilled when registering a device profile. */
    vendor: z.string().trim(),
    /** Profile names some device categories use, as the Beacon API resolves them. */
    profileAliases: z.record(z.array(z.string())),
  }),
  features: z.object({
    /** Maintenance route planning on a map. */
    maintenanceMap: z.boolean(),
    /** Plan routes along roads with OSRM instead of straight lines. Sends stop coordinates to OSRM. */
    roadRouting: z.boolean(),
    /** Device health reports (PDF/CSV). */
    reports: z.boolean(),
    /** Device Data Analysis: upload a CSV and chart it in the browser. */
    deviceDataAnalysis: z.boolean(),
    /** Guided tours for first-time users. */
    productTours: z.boolean(),
    /** In-app feedback launcher, satisfaction banner and post-sign-in rating prompt. */
    feedback: z.boolean(),
  }),
  map: z.object({
    defaultCenter: coordinates,
    defaultZoom: z.number().min(0).max(22),
    tileProvider: mapTileProviderSchema,
    /** Where maintenance routes start; defaults to the map centre. */
    homeLocation: z.object({ latitude: z.number(), longitude: z.number(), name: z.string() }).optional(),
    /** LoRaWAN gateways the maintenance map can load; empty generates samples around the map centre. */
    sampleGateways: z.array(gatewaySchema),
  }),
  monitoring: z.object({
    /** Same-origin route that receives client error reports; empty logs them to the console only. */
    errorReportEndpoint: z.string().trim(),
  }),
  links: z.object({
    docsUrl: optionalUrl,
    privacyPolicyUrl: optionalUrl,
    termsUrl: optionalUrl,
    /** Where devices are added and deployed ({url}/devices/my-devices, {url}/devices/overview). */
    deviceManagement: companionAppSchema,
    /** Where people ask to join an organisation ({url}, {url}/request-organization). */
    organisationAccess: companionAppSchema,
  }),
})

export type BeaconApiAdapter = z.infer<typeof adapterSchema>
export type BeaconAuthProvider = z.infer<typeof authProviderSchema>
export type BeaconConfig = z.infer<typeof beaconConfigSchema>
export type BeaconConfigInput = z.input<typeof beaconConfigSchema>
export type EnvironmentUrl = z.infer<typeof environmentUrl>

export function validateBeaconConfig(config: BeaconConfigInput): BeaconConfig {
  const result = beaconConfigSchema.safeParse(config)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ")

    throw new Error(`Invalid Beacon configuration. ${details}`)
  }

  return result.data
}

/** Whether a group title is the operator's own group. Case-insensitive. */
export function isSystemGroupTitle(title: string | null | undefined, systemGroupSlug: string): boolean {
  return Boolean(title) && title!.trim().toLowerCase() === systemGroupSlug.toLowerCase()
}

/** "Riverside Beacon": short name and app name, or just the app name when they match. */
export function brandTitleOf(config: Pick<BeaconConfig, "org" | "app">): string {
  return config.org.shortName.trim().toLowerCase() === config.app.name.trim().toLowerCase()
    ? config.app.name
    : `${config.org.shortName} ${config.app.name}`
}
