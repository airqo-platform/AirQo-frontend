import { createProxyHandler } from '@/core/utils/proxyClient';

/**
 * Dynamic API proxy handler
 *
 * This file handles all API proxy requests by forwarding them to the actual API
 * but without exposing sensitive tokens on the client side.
 *
 * For routes that need API_TOKEN authentication, the token is added on the server side.
 * For routes requiring JWT auth, the authorization header is forwarded from the client.
 *
 * Path pattern: /api/[...path]
 */

// Auth types constants (keep in sync with secureApiClient.js)
const AUTH_TYPES = {
  AUTO: 'auto',
  NONE: 'none',
  JWT: 'jwt',
  API_TOKEN: 'token',
};

// Determine if the request needs authentication based on the path or explicit header
const handler = (request, { params }) => {
  // Extract path segments
  const { path } = params;

  // Check for explicit auth type header
  const authTypeHeader = request.headers.get('x-auth-type');

  // Default to open access
  let options = { requiresAuth: false, requiresApiToken: false };

  // If explicit auth type is specified in header, use it
  if (authTypeHeader) {
    switch (authTypeHeader) {
      case AUTH_TYPES.NONE:
        options = { requiresAuth: false, requiresApiToken: false };
        break;
      case AUTH_TYPES.JWT:
        options = { requiresAuth: true, requiresApiToken: false };
        break;
      case AUTH_TYPES.API_TOKEN:
        options = { requiresAuth: false, requiresApiToken: true };
        break;
      case AUTH_TYPES.AUTO:
      default:
        // For AUTO or invalid types, fall through to auto-detection
        break;
    }
  }

  // If using AUTO (default) or no explicit auth type was specified,
  // auto-detect based on path
  if (authTypeHeader === AUTH_TYPES.AUTO || !authTypeHeader) {
    if (path && path.length > 0) {
      // Check path to determine authorization requirements
      const endpoint = path[0].toLowerCase();

      // Examples of endpoints that might require different auth types
      if (['users', 'account', 'preferences'].includes(endpoint)) {
        options = { requiresAuth: true, requiresApiToken: false };
      } else if (['analytics', 'devices', 'data'].includes(endpoint)) {
        options = { requiresAuth: false, requiresApiToken: true };
      }
      // Add other endpoint rules as needed
    }
  }

  // Create and execute the appropriate proxy handler
  return createProxyHandler(options)(request, { params });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
