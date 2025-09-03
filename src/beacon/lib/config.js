// lib/config.ts

// Determine if we're running locally
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname.startsWith('192.168.'));

// Use localhost API if running locally, otherwise use staging/production
const getApiUrl = () => {
  if (isLocalhost) {
    return process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:8000';
  }
  return process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL || 'https://staging-platform.airqo.net';
};

export const config = {
  apiUrl: getApiUrl(),
  isLocalhost,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  requiresAuth: !isLocalhost, // No auth required for localhost
  apiPrefix: isLocalhost ? '' : '/api/v1', // No prefix for localhost
}