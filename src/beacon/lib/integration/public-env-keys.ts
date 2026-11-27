// Browser-safe settings only this deployment uses, added to the shared list in lib/public-env.ts.
// They hold the platform API's base URLs (lib/integration/api-urls.js). The exported template
// replaces this file with an empty list (template/overlay/lib/integration/public-env-keys.ts).
export const INTEGRATION_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_AIRQO_API_BASE_URL",
  "NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL",
] as const
