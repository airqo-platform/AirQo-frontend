import { createProxyHandler } from '@/core/utils/proxyClient';
import { NextResponse } from 'next/server';

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

// Cache for endpoint auth requirements to avoid repeated calculations
const endpointAuthCache = new Map();

// Optimized function to determine auth requirements
const getAuthOptions = (path, authTypeHeader) => {
  // Early return for explicit auth type header
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

  // For AUTO detection, check cache first
  if (path && path.length > 0) {
    const endpoint = path[0].toLowerCase();

    if (endpointAuthCache.has(endpoint)) {
      return endpointAuthCache.get(endpoint);
    }

    // Determine auth requirements based on endpoint
    let options = { requiresAuth: false, requiresApiToken: false };

    if (['users', 'account', 'preferences'].includes(endpoint)) {
      options = { requiresAuth: true, requiresApiToken: false };
    } else if (['analytics', 'devices', 'data'].includes(endpoint)) {
      options = { requiresAuth: false, requiresApiToken: true };
    }

    // Cache the result
    endpointAuthCache.set(endpoint, options);
    return options;
  }

  // Default to no auth
  return { requiresAuth: false, requiresApiToken: false };
};

// Determine if the request needs authentication based on the path or explicit header
const handler = (request, { params }) => {
  // Extract path segments
  const { path } = params;

  // Skip NextAuth routes - they should be handled by NextAuth directly
  if (path && path.length > 0 && path[0] === 'auth') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // Check for explicit auth type header
  const authTypeHeader = request.headers.get('x-auth-type');

  // Get optimized auth options
  const options = getAuthOptions(path, authTypeHeader);

  // Create and execute the appropriate proxy handler
  return createProxyHandler(options)(request, { params });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
