// lib/config.js
// API base URLs and environment flags. Branding, features and the data adapter live in
// beacon.config.ts; this file only turns the adapter choice into URLs.
//
// The UI talks to two HTTP APIs:
// - the Beacon API (device health: devices, cohorts, diagnostics, maintenance, reports)
// - the platform API (users, groups, permissions, preferences)
//
// With `api.adapter: "mock"` both point at the mock backend this app serves itself
// (app/api/mock/[...path]), so the template runs with no backend and no credentials.

import { beaconConfig } from '@/beacon.config';

const MOCK_BEACON_API_PATH = '/api/mock/beacon';
const MOCK_PLATFORM_API_PATH = '/api/mock/platform';

const isServer = () => typeof window === 'undefined';

/**
 * Origin for requests to this app: the page's own origin in the browser, and the port Next is
 * listening on for server code. Absolute, because some services build URLs with `new URL()`.
 */
const selfOrigin = () =>
  isServer() ? `http://127.0.0.1:${process.env.PORT || 3000}` : window.location.origin;

/**
 * `development` | `staging` | `production`, from NEXT_PUBLIC_ENV. `next build` always sets
 * NODE_ENV to production, so it can't tell a staging deployment apart.
 */
const getEnvironment = () => {
  const env = (process.env.NEXT_PUBLIC_ENV || '').toLowerCase();
  if (env === 'staging' || env === 'production') return env;
  return 'development';
};

/**
 * Strip trailing slashes; keep localhost/private-network URLs on HTTP, force remote URLs to HTTPS.
 */
export const enforceHttpsForRemote = (url) => {
  const normalizedUrl = url?.replace(/\/$/, '') || '';
  if (!normalizedUrl) return '';

  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname;
    const isPrivateNetworkHost =
      host === 'localhost' ||
      host === '::1' ||
      host.startsWith('127.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

    if (parsed.protocol === 'http:' && !isPrivateNetworkHost) {
      parsed.protocol = 'https:';
      return parsed.toString().replace(/\/$/, '');
    }

    return normalizedUrl;
  } catch {
    return normalizedUrl;
  }
};

const getBeaconApiUrl = () => {
  switch (beaconConfig.api.adapter) {
    case 'mock':
    default:
      return `${selfOrigin()}${MOCK_BEACON_API_PATH}`;
  }
};

const getPlatformApiUrl = () => {
  switch (beaconConfig.api.adapter) {
    case 'mock':
    default:
      return `${selfOrigin()}${MOCK_PLATFORM_API_PATH}`;
  }
};

export const config = {
  get isServer() { return isServer(); },
  get isLocalhost() {
    return typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  },
  get isDevelopment() { return process.env.NODE_ENV === 'development'; },
  get isProduction() { return process.env.NODE_ENV === 'production'; },
  get environment() { return getEnvironment(); },
  get isMockBackend() { return beaconConfig.api.adapter === 'mock'; },

  // API URLs
  get apiUrl() { return getBeaconApiUrl(); },
  get beaconApiUrl() { return getBeaconApiUrl(); },
  get platformUrl() { return getPlatformApiUrl(); },

  // Platform API version
  apiVersion: process.env.PLATFORM_API_VERSION || 'v2',

  // API prefixes
  apiPrefix: '/api/v1',
  beaconApiPrefix: '/api/v1',

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
