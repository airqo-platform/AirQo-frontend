import { stripTrailingSlash } from "@/lib/utils";
export const BASE_API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || ""
);
export const MAP_BOX_BASE_API_URL = stripTrailingSlash(
        process.env.NEXT_PUBLIC_MAPBOX_URL || ""
      );
export const USERS_MGT_URL = `${BASE_API_URL}/users`;
export const DEVICES_MGT_URL = `${BASE_API_URL}/devices`;
export const SITES_MGT_URL = `${BASE_API_URL}/devices/sites`;
export const ANALYTICS_MGT_URL = `${BASE_API_URL}/analytics`;
export const EXCEEDANCES_DATA_URI = `${ANALYTICS_MGT_URL}/exceedances`;
export const DEVICE_EXCEEDANCES_URI = `${ANALYTICS_MGT_URL}/dashboard/exceedances-devices`;
export const AIRQUO_DATA = `${DEVICES_MGT_URL}/readings/map`; 
export const MAP_BOX_SUGGESTIONS = `${MAP_BOX_BASE_API_URL}/search/searchbox/v1/suggest`;
export const MAP_BOX_SEARCH = `${MAP_BOX_BASE_API_URL}/search/searchbox/v1/retrieve`;
