import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_MONITORING_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

export const COLLOCATION = `https://an-326-collocation-scheduling-device-monitoring-p-w7kzhvlewq-ew.a.run.app/api/v1/monitor/devices/collocation`;
