import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_MONITORING_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_BASE_DEVICE_MONITORING_URL,
);

export const COLLOCATION = `${BASE_DEVICE_MONITORING_URL}/monitor/devices/collocation`;
