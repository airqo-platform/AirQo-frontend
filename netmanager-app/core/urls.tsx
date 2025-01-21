import { stripTrailingSlash } from "@/lib/utils";
export const BASE_API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || ""
);
export const USERS_MGT_URL = `${BASE_API_URL}/users`;
export const DEVICES_MGT_URL = `${BASE_API_URL}/devices`;
export const SITES_MGT_URL = `${BASE_API_URL}/devices/sites`;
export const ANALYTICS_MGT_URL = `${BASE_API_URL}/analytics`;
export const EXCEEDANCES_DATA_URI = `${ANALYTICS_MGT_URL}/exceedances`;
export const DEVICE_EXCEEDANCES_URI = `${ANALYTICS_MGT_URL}/dashboard/exceedances-devices`;
