import { stripTrailingSlash } from "@/lib/utils";

const DEFAULT_ANALYTICS_BASE_URL = "https://staging-analytics.airqo.net";

export const BASE_API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || ""
);
export const USERS_MGT_URL = `${BASE_API_URL}/users`;
export const DEVICES_MGT_URL = `${BASE_API_URL}/devices`;
export const SITES_MGT_URL = `${BASE_API_URL}/devices/sites`;
export const ANALYTICS_MGT_URL = `${BASE_API_URL}/analytics`;

const ANALYTICS_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_ANALYTICS_URL || DEFAULT_ANALYTICS_BASE_URL
);
export const forgotPasswordUrl = `${ANALYTICS_BASE_URL}/user/forgotPwd`;
export const signUpUrl = `${ANALYTICS_BASE_URL}/user/creation/individual/register`;
