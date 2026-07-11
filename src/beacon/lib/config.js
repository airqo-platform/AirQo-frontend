// lib/config.js
// Centralized configuration for API endpoints and environment settings

/**
 * Environment detection
 */
const isServer = globalThis.window === undefined;

const isLocalhost = !isServer && 
  (globalThis.location.hostname === 'localhost' || 
   globalThis.location.hostname === '127.0.0.1' || 
   globalThis.location.hostname.startsWith('192.168.'));

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get the current environment context dynamically
 */
const getEnvironment = () => {
  if (!isServer) {
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
    if (hostname.includes('stage') || hostname.includes('staging') || hostname.includes('beacon-stage')) {
      return 'staging';
    }
    return 'production';
  }

  // Server-side detection
  const nextAuthUrl = process.env.NEXTAUTH_URL || '';
  if (nextAuthUrl.includes('stage') || nextAuthUrl.includes('staging') || nextAuthUrl.includes('beacon-stage')) {
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

/**
 * Strip trailing slashes from URLs
 */
const stripTrailingSlash = (url) => url?.replace(/\/$/, '') || '';

/**
 * Keep localhost/private-network URLs on HTTP, force remote URLs to HTTPS
 */
export const enforceHttpsForRemote = (url) => {
  const normalizedUrl = stripTrailingSlash(url);
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
      return stripTrailingSlash(parsed.toString());
    }

    return normalizedUrl;
  } catch {
    if (
      normalizedUrl.startsWith('http://') &&
      !normalizedUrl.includes('localhost') &&
      !normalizedUrl.includes('::1') &&
      !normalizedUrl.includes('//127.') &&
      !normalizedUrl.includes('192.168.') &&
      !normalizedUrl.includes('169.254.') &&
      !normalizedUrl.includes('10.')
    ) {
      return normalizedUrl.replace('http://', 'https://');
    }

    return normalizedUrl;
  }
};

/**
 * Get the appropriate API URL based on environment
 */
const getBeaconApiUrl = () => {
  const env = getEnvironment();

  if (env === 'development') {
    const localUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL || process.env.BEACON_API_URL;
    if (localUrl) return enforceHttpsForRemote(localUrl);
    return 'http://localhost:8000';
  }

  if (env === 'staging') {
    const stagingUrl = process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL || 
                       process.env.AIRQO_STAGING_API_BASE_URL;
    if (stagingUrl) return enforceHttpsForRemote(stagingUrl);
    return 'https://staging-platform.airqo.net';
  }

  // Production
  const prodUrl = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 
                  process.env.AIRQO_API_BASE_URL;
  if (prodUrl) return enforceHttpsForRemote(prodUrl);

  return 'https://platform.airqo.net';
};

/**
 * Get the AirQo Platform API URL (for auth, users, etc.)
 */
const getAirQoPlatformApiUrl = () => {
  const env = getEnvironment();
  
  if (env === 'development' || env === 'staging') {
    const stagingUrl = process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL || 
                       process.env.AIRQO_STAGING_API_BASE_URL;
    if (stagingUrl) return enforceHttpsForRemote(stagingUrl);
    return 'https://staging-platform.airqo.net';
  }
  
  // Production
  const prodUrl = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 
                  process.env.AIRQO_API_BASE_URL;
  if (prodUrl) return enforceHttpsForRemote(prodUrl);
  
  return 'https://platform.airqo.net';
};

/**
 * API Configuration with dynamic properties
 */
export const config = {
  // Environment flags
  get isServer() { return typeof window === 'undefined'; },
  get isLocalhost() {
    return typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname.startsWith('192.168.'));
  },
  get isDevelopment() { return process.env.NODE_ENV === 'development'; },
  get isProduction() { return process.env.NODE_ENV === 'production'; },
  get environment() { return getEnvironment(); },
  
  // API URLs
  get apiUrl() { return getBeaconApiUrl(); },
  get beaconApiUrl() { return getBeaconApiUrl(); },
  get airqoPlatformUrl() { return getAirQoPlatformApiUrl(); },
  
  // API version
  apiVersion: process.env.AIRQO_API_VERSION || 'v2',
  
  // API prefixes
  apiPrefix: '/api/v1',
  get beaconApiPrefix() { return this.isLocalhost ? '/api/v1' : '/api/v1/beacon'; },
  
  // Auth settings
  get requiresAuth() { return !this.isLocalhost && this.isProduction; },
  
  // Timeouts
  defaultTimeout: 30000,
  uploadTimeout: 120000,
};

/**
 * Build full API URL with path
 */
export const buildApiUrl = (path, usePrefix = true) => {
  const baseUrl = config.apiUrl;
  const prefix = usePrefix ? config.apiPrefix : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${prefix}${cleanPath}`;
};

/**
 * Build AirQo Platform API URL with path
 */
export const buildPlatformApiUrl = (path, version = config.apiVersion) => {
  const baseUrl = config.airqoPlatformUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/api/${version}/${cleanPath}`;
};

export default config;