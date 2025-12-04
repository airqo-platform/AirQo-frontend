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
 * Strip trailing slashes from URLs
 */
const stripTrailingSlash = (url) => url?.replace(/\/$/, '') || '';

/**
 * Get the appropriate API URL based on environment
 * Priority: 
 * 1. NEXT_PUBLIC_LOCAL_API_URL (for local development with local backend)
 * 2. NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL (for staging)
 * 3. NEXT_PUBLIC_AIRQO_API_BASE_URL (for production)
 * 4. AIRQO_STAGING_API_BASE_URL (server-side staging)
 * 5. AIRQO_API_BASE_URL (server-side production)
 */
const getBeaconApiUrl = () => {
  // For local development, use local API
  if (isLocalhost || isDevelopment) {
    const localUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
    if (localUrl) return stripTrailingSlash(localUrl);
  }
  
  // For client-side, prefer NEXT_PUBLIC_ variables
  if (!isServer) {
    const stagingUrl = process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL;
    const prodUrl = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL;
    if (stagingUrl) return stripTrailingSlash(stagingUrl);
    if (prodUrl) return stripTrailingSlash(prodUrl);
  }
  
  // For server-side, can use non-public variables
  const serverStagingUrl = process.env.AIRQO_STAGING_API_BASE_URL;
  const serverProdUrl = process.env.AIRQO_API_BASE_URL;
  if (serverStagingUrl) return stripTrailingSlash(serverStagingUrl);
  if (serverProdUrl) return stripTrailingSlash(serverProdUrl);
  
  // Default fallback (should be avoided in production)
  console.warn('No API URL configured, using default localhost:8000');
  return 'http://localhost:8000';
};

/**
 * Get the AirQo Platform API URL (for auth, users, etc.)
 */
const getAirQoPlatformApiUrl = () => {
  // Prefer staging for development
  if (isDevelopment) {
    const stagingUrl = process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL || 
                       process.env.AIRQO_STAGING_API_BASE_URL;
    if (stagingUrl) return stripTrailingSlash(stagingUrl);
  }
  
  // Production
  const prodUrl = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 
                  process.env.AIRQO_API_BASE_URL;
  if (prodUrl) return stripTrailingSlash(prodUrl);
  
  // Fallback to staging
  const stagingUrl = process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL || 
                     process.env.AIRQO_STAGING_API_BASE_URL;
  if (stagingUrl) return stripTrailingSlash(stagingUrl);
  
  return 'https://staging-platform.airqo.net';
};

/**
 * API Configuration
 */
export const config = {
  // Environment flags
  isServer,
  isLocalhost,
  isDevelopment,
  isProduction,
  
  // API URLs
  apiUrl: getBeaconApiUrl(),
  beaconApiUrl: getBeaconApiUrl(),
  airqoPlatformUrl: getAirQoPlatformApiUrl(),
  
  // API version
  apiVersion: process.env.AIRQO_API_VERSION || 'v2',
  
  // API prefixes
  apiPrefix: isLocalhost ? '' : '/api/v1',
  beaconApiPrefix: isLocalhost ? '' : '/api/v1/beacon',
  
  // Auth settings
  requiresAuth: !isLocalhost && isProduction,
  
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