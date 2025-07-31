/**
 * Proxy configuration for API routing and authentication
 * Centralizes endpoint configuration and auth requirements
 */

import logger from "@/lib/logger";

export interface EndpointConfig {
  requiresAuth: boolean;
  requiresApiToken: boolean;
  timeout?: number;
  retries?: number;
}

export const AUTH_TYPES = {
  AUTO: 'auto',
  NONE: 'none',
  JWT: 'jwt',
  API_TOKEN: 'token',
} as const;

export type AuthType = typeof AUTH_TYPES[keyof typeof AUTH_TYPES];

/**
 * Endpoint configuration mapping
 * Defines authentication requirements for different API endpoints
 */
export const ENDPOINT_CONFIG: Record<string, EndpointConfig> = {
  // User management endpoints - require JWT authentication
  users: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  account: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  preferences: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  profile: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  organizations: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  roles: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  permissions: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },

  // Data and analytics endpoints - require API token
  analytics: {
    requiresAuth: false,
    requiresApiToken: true,
    timeout: 45000, // Longer timeout for analytics
  },
  devices: {
    requiresAuth: false,
    requiresApiToken: true,
    timeout: 30000,
  },
  data: {
    requiresAuth: false,
    requiresApiToken: true,
    timeout: 45000,
  },
  measurements: {
    requiresAuth: false,
    requiresApiToken: true,
    timeout: 30000,
  },
  sites: {
    requiresAuth: false,
    requiresApiToken: true,
    timeout: 30000,
  },
  grids: {
    requiresAuth: true,
    requiresApiToken: false,
    timeout: 30000,
  },
  cohorts: {
    requiresAuth: false,
    requiresApiToken: true,
    timeout: 30000,
  },

  // Public endpoints - no authentication required
  health: {
    requiresAuth: false,
    requiresApiToken: false,
    timeout: 10000,
  },
  status: {
    requiresAuth: false,
    requiresApiToken: false,
    timeout: 10000,
  },
  version: {
    requiresAuth: false,
    requiresApiToken: false,
    timeout: 10000,
  },

  // Mixed endpoints - require both JWT and API token for certain operations
  'user-devices': {
    requiresAuth: true,
    requiresApiToken: true,
    timeout: 30000,
  },
  'user-analytics': {
    requiresAuth: true,
    requiresApiToken: true,
    timeout: 45000,
  },
};

/**
 * Default configuration for unknown endpoints
 */
export const DEFAULT_ENDPOINT_CONFIG: EndpointConfig = {
  requiresAuth: false,
  requiresApiToken: false,
  timeout: 30000,
};

/**
 * Gets configuration for a specific endpoint
 * @param endpoint - The endpoint name
 * @returns Configuration for the endpoint
 */
export const getEndpointConfig = (endpoint: string): EndpointConfig => {
  return ENDPOINT_CONFIG[endpoint.toLowerCase()] || DEFAULT_ENDPOINT_CONFIG;
};

/**
 * Determines auth options based on endpoint and explicit auth type
 * @param path - Request path segments
 * @param authTypeHeader - Explicit auth type from headers
 * @returns Authentication configuration
 */
export const getAuthOptions = (
  path: string[] | string, 
  authTypeHeader?: string
): EndpointConfig => {
  // Handle explicit auth type header
  if (authTypeHeader && authTypeHeader !== AUTH_TYPES.AUTO) {
    switch (authTypeHeader) {
      case AUTH_TYPES.NONE:
        return { requiresAuth: false, requiresApiToken: false };
      case AUTH_TYPES.JWT:
        return { requiresAuth: true, requiresApiToken: false };
      case AUTH_TYPES.API_TOKEN:
        return { requiresAuth: false, requiresApiToken: true };
      default:
        break;
    }
  }

  // Auto-detect based on endpoint
  if (path && (Array.isArray(path) ? path.length > 0 : path.length > 0)) {
    const endpoint = Array.isArray(path) ? path[0] : path.split('/')[0];
    return getEndpointConfig(endpoint.toLowerCase());
  }

  return DEFAULT_ENDPOINT_CONFIG;
};

/**
 * Validates proxy configuration
 * @returns True if configuration is valid
 */
export const validateProxyConfig = (): boolean => {
  try {
    // Check if required environment variables are set
    const requiredVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_API_TOKEN'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      logger.error('Missing required environment variables for proxy:', missing);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating proxy configuration:', error);
    return false;
  }
};
