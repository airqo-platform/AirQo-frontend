import { z } from "zod";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const adapterSchema = z.enum(["mock", "airqo"]);
const authProviderSchema = z.enum(["none", "airqo"]);
const mapTileProviderSchema = z.enum(["openstreetmap", "mapbox"]);

const nonEmptyString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const optionalUrl = z.string().url().optional().or(z.literal(""));

const vertexConfigSchema = z
  .object({
    org: z.object({
      name: nonEmptyString("Organization name"),
      shortName: nonEmptyString("Organization short name"),
      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Organization slug must use lowercase letters, numbers, and hyphens",
        ),
      logo: nonEmptyString("Organization logo"),
      primaryColor: z
        .string()
        .trim()
        .regex(HEX_COLOR_PATTERN, "Primary color must be a valid hex color"),
      supportEmail: z.string().trim().email("Support email must be valid"),
      websiteUrl: optionalUrl,
    }),
    api: z.object({
      adapter: adapterSchema,
      baseUrl: optionalUrl,
      publicMeasurementsBaseUrl: optionalUrl,
    }),
    auth: z.object({
      provider: authProviderSchema,
      systemGroupSlug: z.string().trim().min(1).optional(),
    }),
    features: z.object({
      deviceMap: z.boolean(),
      bulkDeploy: z.boolean(),
      siteManagement: z.boolean(),
      exportCSV: z.boolean(),
      readingHistory: z.boolean(),
      userManagement: z.boolean(),
      desktopDownload: z.boolean(),
      appLauncher: z.boolean(),
      shipping: z.boolean(),
      networkRequests: z.boolean(),
    }),
    map: z.object({
      defaultCenter: z
        .tuple([z.number(), z.number()])
        .refine(
          ([latitude]) => latitude >= -90 && latitude <= 90,
          "Map latitude must be between -90 and 90",
        )
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
      cookiePolicyUrl: optionalUrl,
      analyticsUrl: optionalUrl,
      desktopDownloadUrl: optionalUrl,
    }),
  })
  .superRefine((config, ctx) => {
    if (config.api.adapter === "airqo" && !config.api.baseUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["api", "baseUrl"],
        message: "api.baseUrl is required when api.adapter is airqo",
      });
    }

    if (config.auth.provider === "airqo" && config.api.adapter !== "airqo") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["auth", "provider"],
        message: "auth.provider airqo requires api.adapter airqo",
      });
    }
  });

export type VertexApiAdapter = z.infer<typeof adapterSchema>;
export type VertexAuthProvider = z.infer<typeof authProviderSchema>;
export type VertexMapTileProvider = z.infer<typeof mapTileProviderSchema>;
export type VertexConfig = z.infer<typeof vertexConfigSchema>;
export type VertexConfigInput = z.input<typeof vertexConfigSchema>;

export const defaultVertexConfig: VertexConfigInput = {
  org: {
    name: "Vertex Demo",
    shortName: "Vertex",
    slug: "vertex-demo",
    logo: "/images/airqo_logo.svg",
    primaryColor: "#145FFF",
    supportEmail: "support@example.org",
    websiteUrl: "",
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

export function validateVertexConfig(config: VertexConfigInput): VertexConfig {
  const result = vertexConfigSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid Vertex configuration. ${details}`);
  }

  return result.data;
}
