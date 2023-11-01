import { stripTrailingSlash } from '../utils/strings';
import { NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

export const DEVICES = `${BASE_DEVICE_REGISTRY_URL}/devices`;

export const GRIDS_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/grids/summary`

