import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';
import { stripTrailingSlash } from '../utils/strings';

const BASE_AUTH_URL = stripTrailingSlash(NEXT_PUBLIC_API_BASE_URL);

export const DATA_EXPORT_URL = `${BASE_AUTH_URL}/analytics/data-download`;

export const SHARE_REPORT_URL = `${BASE_AUTH_URL}/users/emailReport`;
