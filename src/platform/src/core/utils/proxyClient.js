import axios from 'axios';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/app/api/auth/[...nextauth]/options.js';
import logger from '@/lib/logger';
import { getApiBaseUrl, getApiToken } from '@/lib/envConstants';

// For App Router compatibility
/* global Response */

// Simple cache for session data to avoid repeated NextAuth calls
const sessionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedSession = async () => {
  const now = Date.now();
  const cacheKey = 'nextauth_session';

  // Check if we have valid cached session
  if (sessionCache.has(cacheKey)) {
    const { session, timestamp } = sessionCache.get(cacheKey);
    if (now - timestamp < CACHE_TTL) {
      return session;
    }
    // Cache expired, remove it
    sessionCache.delete(cacheKey);
  }

  // Get fresh session
  try {
    const session = await getServerSession(authOptions);
    sessionCache.set(cacheKey, { session, timestamp: now });
    return session;
  } catch {
    // If session retrieval fails, return null
    return null;
  }
};

/**
 * Creates a proxy request handler for Next.js API routes
 * @param {Object} options - Configuration options
 * @param {boolean} options.requiresAuth - Whether the endpoint requires authentication
 * @param {boolean} options.requiresApiToken - Whether the endpoint requires API token
 * @returns {Function} - Request handler function for Next.js API routes
 */
export const createProxyHandler = (options = {}) => {
  const { requiresAuth = false, requiresApiToken = false } = options;

  return async (req, context) => {
    // Handle both App Router and Pages Router formats
    let path, queryParams, res;

    if (context && context.params) {
      // App Router format - context contains params
      path = context.params.path;
      res = new Response(); // We'll build this manually for App Router
      // For App Router, query params need to be extracted from the URL
      try {
        const url = new URL(req.url);
        queryParams = Object.fromEntries(url.searchParams.entries());
      } catch (urlError) {
        logger.error('Proxy client: Failed to parse request URL', {
          message: "Failed to construct 'URL': Invalid base URL",
          url: req.url,
          error: urlError.message,
        });
        return new Response('Bad Request: Invalid URL', { status: 400 });
      }
    } else {
      // Pages Router format - second parameter is res object
      res = context;
      const extracted = req.query;
      path = extracted.path;
      const { path: _, ...otherParams } = extracted;
      queryParams = otherParams;
    }

    const targetPath = Array.isArray(path) ? path.join('/') : path;

    // Only allow specified methods
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!allowedMethods.includes(req.method)) {
      const errorResponse = {
        success: false,
        message: 'Method not allowed',
      };

      if (context && context.params) {
        // App Router - return Response object
        return new Response(JSON.stringify(errorResponse), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Pages Router - use res object
        return res.status(405).json(errorResponse);
      }
    }

    try {
      // Create request config with enhanced error handling
      let API_BASE_URL;
      try {
        API_BASE_URL = getApiBaseUrl();
      } catch (envError) {
        logger.error('Failed to get API base URL from environment:', envError);
        const errorResponse = {
          success: false,
          message: 'API configuration error: Unable to determine base URL',
        };

        if (context && context.params) {
          return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          return res.status(500).json(errorResponse);
        }
      }
      if (!API_BASE_URL) {
        logger.error('API_BASE_URL environment variable not defined');
        const errorResponse = {
          success: false,
          message: 'API configuration error: Base URL not defined',
        };

        if (context && context.params) {
          return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          return res.status(500).json(errorResponse);
        }
      }

      // Import the URL helper functions safely
      let normalizeUrl;
      try {
        const urlHelpers = await import('../utils/urlHelpers');
        normalizeUrl = urlHelpers.normalizeUrl;
      } catch (importError) {
        logger.error('Failed to import URL helpers:', importError);
        // Fallback URL normalization
        normalizeUrl = (url) => url?.replace(/\/+$/, '') || '';
      }

      // Normalize the base URL (remove trailing slashes) with validation
      let normalizedBaseUrl;
      try {
        normalizedBaseUrl = normalizeUrl(API_BASE_URL);
        // Validate that we have a proper URL
        if (!normalizedBaseUrl || normalizedBaseUrl.length === 0) {
          throw new Error('Invalid base URL after normalization');
        }
      } catch (urlError) {
        logger.error('Failed to normalize base URL:', urlError);
        const errorResponse = {
          success: false,
          message: 'API configuration error: Invalid base URL',
        };

        if (context && context.params) {
          return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          return res.status(500).json(errorResponse);
        }
      }

      // Configure the request with safe URL construction
      const config = {
        method: req.method,
        url: `${normalizedBaseUrl}/${targetPath}`,
        params: { ...queryParams },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout to prevent hanging requests
      };

      // Handle request body for POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (context && context.params) {
          // App Router - request body needs to be read differently
          try {
            const body = await req.text();
            if (body) {
              config.data = JSON.parse(body);
            }
          } catch {
            // Handle case where body is not JSON or empty
            config.data = {};
          }
        } else {
          // Pages Router - body is directly available
          if (req.body) {
            config.data = req.body;
          }
        }
      } // Add API token if required (server-side only)
      if (requiresApiToken) {
        // Use server-side environment variable - not exposed to client
        const API_TOKEN = getApiToken();

        if (!API_TOKEN) {
          throw new Error('API_TOKEN environment variable not defined');
        }
        // Add the token to the request params
        config.params.token = API_TOKEN;
      }

      // Add JWT token if required
      if (requiresAuth) {
        let authHeader;

        if (context && context.params) {
          // App Router - use cached session to avoid repeated NextAuth calls
          const session = await getCachedSession();
          if (session?.user?.accessToken) {
            // Ensure token starts with "JWT " as required by the API
            const token = session.user.accessToken;
            authHeader = token.startsWith('JWT ') ? token : `JWT ${token}`;
          } else {
            // Fallback to header from Request object
            authHeader = req.headers.get('authorization');
          }
        } else {
          // Pages Router - get from req.headers object
          authHeader = req.headers.authorization;
        }

        if (authHeader) {
          // Ensure the token starts with "JWT " for API compatibility
          if (
            !authHeader.startsWith('JWT ') &&
            !authHeader.startsWith('Bearer ')
          ) {
            authHeader = `JWT ${authHeader}`;
          }
          config.headers.Authorization = authHeader;
        }
      }

      // Make the request
      const response = await axios(config);

      // Return the response based on the format
      if (context && context.params) {
        // App Router - return Response object
        return new Response(JSON.stringify(response.data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Pages Router - use res object
        return res.status(response.status).json(response.data);
      }
    } catch (error) {
      // Forward error status code and message or fallback to generic error
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data || {
        success: false,
        message: 'An error occurred while processing the request',
      };

      if (context && context.params) {
        // App Router - return Response object
        return new Response(JSON.stringify(errorMessage), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Pages Router - use res object
        return res.status(statusCode).json(errorMessage);
      }
    }
  };
};
