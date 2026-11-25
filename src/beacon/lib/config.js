// lib/config.js
// API base URLs and environment flags. Branding, features and the data adapter live in
// beacon.config.ts; this file turns the adapter choice into URLs.
//
// The UI talks to two HTTP APIs:
// - the Beacon API (device health: devices, cohorts, diagnostics, maintenance, reports)
// - the platform API (users, groups, permissions, preferences)
//
// `api.adapter: "http"` takes their URLs from lib/integration/api-urls.js. `"mock"` points both at
// the mock backend this app serves itself (app/api/mock/[...path]), so it runs with no backend.

import { beaconConfig } from '@/beacon.config';
import { httpBeaconApiPrefix, httpBeaconApiUrl, httpPlatformApiUrl } from '@/lib/integration/api-urls';
import { getPublicEnv } from '@/lib/public-env';

export { enforceHttpsForRemote } from '@/lib/url-utils';

const MOCK_BEACON_API_PATH = '/api/mock/beacon';
const MOCK_PLATFORM_API_PATH = '/api/mock/platform';

const isServer = () => typeof window === 'undefined';
const isMock = () => beaconConfig.api.adapter === 'mock';

/**
 * Origin for requests to this app: the page's own origin in the browser, and the port Next is
 * listening on for server code. Absolute, because some services build URLs with `new URL()`.
 */
const selfOrigin = () =>
  isServer() ? `http://127.0.0.1:${process.env.PORT || 3000}` : window.location.origin;

const isLocalhostHost = () =>
  !isServer() &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

/**
 * `development` | `staging` | `production`. NEXT_PUBLIC_ENV wins when set; otherwise it's read
 * from the address the app is running on, because `next build` always sets NODE_ENV to production.
 */
const getEnvironment = () => {
  const forced = (getPublicEnv('NEXT_PUBLIC_ENV') || '').toLowerCase();
  if (forced === 'development' || forced === 'staging' || forced === 'production') return forced;

  if (!isServer()) {
    const hostname = globalThis.location.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return 'development';
    }
    if (hostname.includes('stage') || hostname.includes('staging')) {
      return 'staging';
    }
    return 'production';
  }

  // Server-side detection
  const nextAuthUrl = process.env.NEXTAUTH_URL || '';
  if (nextAuthUrl.includes('stage') || nextAuthUrl.includes('staging')) {
    return 'staging';
  }

  const serviceName = (process.env.SERVICE_NAME || '').toLowerCase();
  const podHostName = (process.env.HOSTNAME || '').toLowerCase();
  if (serviceName.includes('stage') || podHostName.includes('stage')) {
    return 'staging';
  }

  if (nextAuthUrl.includes('localhost') || nextAuthUrl.includes('127.0.0.1')) {
    return 'development';
  }

  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }

  return 'production';
};

const getBeaconApiUrl = () =>
  isMock() ? `${selfOrigin()}${MOCK_BEACON_API_PATH}` : httpBeaconApiUrl(getEnvironment());

const getPlatformApiUrl = () =>
  isMock() ? `${selfOrigin()}${MOCK_PLATFORM_API_PATH}` : httpPlatformApiUrl(getEnvironment());

export const config = {
  get isServer() { return isServer(); },
  get isLocalhost() { return isLocalhostHost(); },
  get isDevelopment() { return process.env.NODE_ENV === 'development'; },
  get isProduction() { return process.env.NODE_ENV === 'production'; },
  get environment() { return getEnvironment(); },
  get isMockBackend() { return isMock(); },

  // API URLs
  get apiUrl() { return getBeaconApiUrl(); },
  get beaconApiUrl() { return getBeaconApiUrl(); },
  get platformUrl() { return getPlatformApiUrl(); },

  // Platform API version
  apiVersion: process.env.PLATFORM_API_VERSION || 'v2',

  // API prefixes
  apiPrefix: '/api/v1',
  get beaconApiPrefix() { return isMock() ? '/api/v1' : httpBeaconApiPrefix(isLocalhostHost()); },

  // Auth settings
  get requiresAuth() { return !isLocalhostHost() && this.isProduction; },

  // Timeouts
  defaultTimeout: 30000,
  uploadTimeout: 120000,
};

/**
 * Build a Beacon API URL with path
 */
export const buildApiUrl = (path, usePrefix = true) => {
  const prefix = usePrefix ? config.apiPrefix : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiUrl}${prefix}${cleanPath}`;
};

/**
 * Build a platform API URL with path
 */
export const buildPlatformApiUrl = (path, version = config.apiVersion) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.platformUrl}/api/${version}/${cleanPath}`;
};

export default config;
