// lib/config.js
/**
 * Central configuration for the application
 * Always uses remote backend server
 */

// API configuration - always use remote backend
export const config = {
  // Use environment variable if set, otherwise default to remote server
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://srv828289.hstgr.cloud:8000',
  
  // Add any other configuration values here
  apiToken: process.env.AIRQO_API_TOKEN,
  
  // WebSocket URL (if needed)
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://srv828289.hstgr.cloud:8080',
  
  // App URL
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

// Log configuration during initialization (helps with debugging)
if (typeof window !== 'undefined') {
  console.log('App config initialized:', {
    apiUrl: config.apiUrl,
    hasToken: !!config.apiToken,
  });
}