// Base URLs for `api.adapter: "http"`: a Beacon API and a platform API that implement the
// contract the mock backend serves (see lib/mock/). Set both at build time.

import { enforceHttpsForRemote } from '@/lib/url-utils';
import { getPublicEnv } from '@/lib/public-env';

/** Beacon API base URL (devices, cohorts, sites, diagnostics, maintenance). */
export function httpBeaconApiUrl() {
  return enforceHttpsForRemote(getPublicEnv('NEXT_PUBLIC_BEACON_API_URL') || 'http://localhost:8000');
}

/** Platform API base URL (users, groups, preferences, network status). */
export function httpPlatformApiUrl() {
  return enforceHttpsForRemote(getPublicEnv('NEXT_PUBLIC_PLATFORM_API_URL') || 'http://localhost:8001');
}

/** Path prefix of the Beacon API. */
export function httpBeaconApiPrefix() {
  return getPublicEnv('NEXT_PUBLIC_BEACON_API_PREFIX') || '/api/v1';
}
