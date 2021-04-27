import { stripTrailingSlash } from "../utils";

const BASE_DATA_MANAGEMENT_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_URL
);

export const ADD_MAINTENANCE_URI = `${BASE_DATA_MANAGEMENT_URL}/data/channels/maintenance/add`;
export const DEVICE_RECENT_FEEDS = `${BASE_DATA_MANAGEMENT_URL}/data/feeds/transform/recent`;
