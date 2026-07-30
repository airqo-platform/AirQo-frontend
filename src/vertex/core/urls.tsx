import { stripTrailingSlash } from "@/lib/utils";

const isProduction =
  process.env.NEXT_PUBLIC_ENV === "production" ||
  process.env.NODE_ENV === "production";
const DEFAULT_ANALYTICS_BASE_URL = isProduction 
  ? "https://analytics.airqo.net" 
  : "https://staging-analytics.airqo.net";

export const BASE_API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || ""
);
export const USERS_MGT_URL = `${BASE_API_URL}/users`;
export const DEVICES_MGT_URL = `${BASE_API_URL}/devices`;
export const SITES_MGT_URL = `${BASE_API_URL}/devices/sites`;
export const ANALYTICS_MGT_URL = `${BASE_API_URL}/analytics`;

export const ANALYTICS_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_ANALYTICS_URL || DEFAULT_ANALYTICS_BASE_URL
);
export const forgotPasswordUrl = `${ANALYTICS_BASE_URL}/user/forgotPwd`;
export const profileSettingsUrl = `${ANALYTICS_BASE_URL}/user/profile`;
export const signUpUrl = `${ANALYTICS_BASE_URL}/user/creation/individual/register`;

/**
 * Production host -> staging host for cross-app links.
 *
 * The mapping is explicit because the convention is not uniform: most apps take
 * a `staging-` prefix, while the marketing site uses a `staging.` subdomain.
 * Hosts absent from this table are left alone (no known staging deployment).
 */
const STAGING_HOSTS: Readonly<Record<string, string>> = {
  "analytics.airqo.net": "staging-analytics.airqo.net",
  "vertex.airqo.net": "staging-vertex.airqo.net",
  "beacon.airqo.net": "staging-beacon.airqo.net",
  "platform.airqo.net": "staging-platform.airqo.net",
  "airqo.net": "staging.airqo.net",
  "www.airqo.net": "staging.airqo.net",
};

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];

/**
 * Rewrites a production cross-app URL to its staging equivalent when the current
 * page is itself on staging (or running locally).
 *
 * Detection is by runtime hostname rather than `NODE_ENV`: the staging deployment
 * is a production Next.js build, so `NODE_ENV === "production"` there too and
 * would incorrectly hand out production links.
 */
export const getEnvironmentAwareUrl = (baseUrl: string): string => {
  // Server-side render: no hostname to inspect, so emit the URL as written.
  if (typeof window === "undefined") return baseUrl;

  try {
    const currentHost = (window.location?.hostname || "").toLowerCase();
    const isLocalhost = LOCAL_HOSTNAMES.includes(currentHost);
    const isStaging = currentHost.includes("staging");

    if (!isStaging && !isLocalhost) return baseUrl;

    const parsed = new URL(baseUrl);
    const stagingHost = STAGING_HOSTS[parsed.hostname.toLowerCase()];
    if (!stagingHost) return baseUrl;

    parsed.hostname = stagingHost;
    return parsed.toString();
  } catch {
    return baseUrl;
  }
};
