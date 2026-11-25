// Base URLs for `api.adapter: "http"` on AirQo's deployments: the Beacon API (beacon-api) and the
// AirQo platform API, chosen by environment. The exported template replaces this file with a
// generic version (template/overlay/lib/integration/api-urls.js).

import { enforceHttpsForRemote } from '@/lib/url-utils';
import { getPublicEnv } from '@/lib/public-env';

/** Beacon API base URL. Local development talks to a local beacon-api; deployments to the platform. */
export function httpBeaconApiUrl(environment) {
  if (environment === 'development') {
    const localUrl = getPublicEnv('NEXT_PUBLIC_LOCAL_API_URL') || process.env.BEACON_API_URL;
    if (localUrl) return enforceHttpsForRemote(localUrl);
    return 'http://localhost:8000';
  }

  if (environment === 'staging') {
    const stagingUrl = getPublicEnv('NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL') ||
                       process.env.AIRQO_STAGING_API_BASE_URL;
    if (stagingUrl) return enforceHttpsForRemote(stagingUrl);
    return 'https://staging-platform.airqo.net';
  }

  const prodUrl = getPublicEnv('NEXT_PUBLIC_AIRQO_API_BASE_URL') ||
                  process.env.AIRQO_API_BASE_URL;
  if (prodUrl) return enforceHttpsForRemote(prodUrl);

  return 'https://platform.airqo.net';
}

/** Platform API base URL (users, groups, preferences). Development and staging use staging. */
export function httpPlatformApiUrl(environment) {
  if (environment === 'development' || environment === 'staging') {
    const stagingUrl = getPublicEnv('NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL') ||
                       process.env.AIRQO_STAGING_API_BASE_URL;
    if (stagingUrl) return enforceHttpsForRemote(stagingUrl);
    return 'https://staging-platform.airqo.net';
  }

  const prodUrl = getPublicEnv('NEXT_PUBLIC_AIRQO_API_BASE_URL') ||
                  process.env.AIRQO_API_BASE_URL;
  if (prodUrl) return enforceHttpsForRemote(prodUrl);

  return 'https://platform.airqo.net';
}

/** A local beacon-api serves /api/v1; behind the platform gateway it's /api/v1/beacon. */
export function httpBeaconApiPrefix(isLocalhost) {
  return isLocalhost ? '/api/v1' : '/api/v1/beacon';
}
