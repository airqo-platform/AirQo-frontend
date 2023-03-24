import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_MONITORING_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

export const COLLOCATION = `http://104.155.76.226:5001/api/v1/monitor/devices/collocation`;
