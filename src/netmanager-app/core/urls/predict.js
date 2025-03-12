import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';
import { stripTrailingSlash } from '../utils/strings';

const BASE_AUTH_URL = stripTrailingSlash(NEXT_PUBLIC_API_BASE_URL);

export const DAILY_PREDICTIONS_URL = `${BASE_AUTH_URL}/predict/daily-forecast`;
