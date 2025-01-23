import { stripTrailingSlash } from '../utils';

const BASE_ANALYTICS_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_ANALYTICS_URL || process.env.REACT_APP_BASE_URL_V2
);

export const META_DATA_URL = `${BASE_ANALYTICS_URL}/meta-data`;

export const ADMIN_LEVELS_URL = `${META_DATA_URL}/administrative-levels`;
