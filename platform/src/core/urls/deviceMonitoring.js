import { stripTrailingSlash } from '../utils/strings';
import { NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';

const BASE_DEVICE_MONITORING_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

export const COLLOCATION = `${BASE_DEVICE_MONITORING_URL}/monitor/collocation`;

export const DELETE_COLLOCATION_DEVICE = `${COLLOCATION}?TOKEN=${NEXT_PUBLIC_API_TOKEN}`;
