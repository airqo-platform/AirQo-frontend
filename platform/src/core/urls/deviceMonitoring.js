import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_MONITORING_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

export const COLLOCATION = `${BASE_DEVICE_MONITORING_URL}/monitor/collocation`;
