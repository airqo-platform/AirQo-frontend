import { stripTrailingSlash } from '@/lib/utils';

const ANALYTICS_BASE_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_ANALYTICS_URL || '');

export const forgotPasswordUrl = ANALYTICS_BASE_URL
  ? `${ANALYTICS_BASE_URL}/user/forgotPwd`
  : '';

export const signUpUrl = ANALYTICS_BASE_URL
  ? `${ANALYTICS_BASE_URL}/user/creation/individual/register`
  : '';