import { z } from "zod"

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}){1,2}$/

const adapterSchema = z.enum(["mock"])
const authProviderSchema = z.enum(["none"])
const mapTileProviderSchema = z.enum(["openstreetmap"])

const nonEmptyString = (fieldName: string) => z.string().trim().min(1, `${fieldName} is required`)

const optionalUrl = z.string().url().optional().or(z.literal(""))

const beaconConfigSchema = z.object({
  org: z.object({
    /** Full name, used in page titles, the sign-in page and reports. */
    name: nonEmptyString("Organization name"),
    /** Short name, used where space is tight (top bar, PDF footers). */
    shortName: nonEmptyString("Organization short name"),
    slug: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Organization slug must use lowercase letters, numbers, and hyphens",
      ),
    /** Path under public/. */
    logo: nonEmptyString("Organization logo"),
    primaryColor: z.string().trim().regex(HEX_COLOR_PATTERN, "Primary color must be a valid hex color"),
    supportEmail: z.string().trim().email("Support email must be valid"),
    websiteUrl: optionalUrl,
  }),
  app: z.object({
    /** Product name shown next to the logo, e.g. "Beacon". */
    name: nonEmptyString("App name"),
    description: z.string().trim(),
  }),
  api: z.object({
    adapter: adapterSchema,
  }),
  auth: z.object({
    provider: authProviderSchema,
    /**
     * Title of the operator's own group. Members get the internal experience: the
     * administrative panel, fleet-wide diagnostics and personal devices.
     */
    systemGroupSlug: z.string().trim().min(1),
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
    /** In-app feedback launcher. */
    feedback: z.boolean(),
  }),
  map: z.object({
    defaultCenter: z
      .tuple([z.number(), z.number()])
      .refine(([latitude]) => latitude >= -90 && latitude <= 90, "Map latitude must be between -90 and 90")
      .refine(
        ([, longitude]) => longitude >= -180 && longitude <= 180,
        "Map longitude must be between -180 and 180",
      ),
    defaultZoom: z.number().min(0).max(22),
    tileProvider: mapTileProviderSchema,
  }),
  links: z.object({
    docsUrl: optionalUrl,
    privacyPolicyUrl: optionalUrl,
    termsUrl: optionalUrl,
    /** App where devices are added and deployed. Empty hides the "Add devices" prompts. */
    deviceManagementUrl: optionalUrl,
    /** App where people request access to an organisation. Empty hides those prompts. */
    organisationAccessUrl: optionalUrl,
  }),
})

export type BeaconApiAdapter = z.infer<typeof adapterSchema>
export type BeaconAuthProvider = z.infer<typeof authProviderSchema>
export type BeaconConfig = z.infer<typeof beaconConfigSchema>
export type BeaconConfigInput = z.input<typeof beaconConfigSchema>

export const defaultBeaconConfig: BeaconConfigInput = {
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
    roadRouting: false,
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
