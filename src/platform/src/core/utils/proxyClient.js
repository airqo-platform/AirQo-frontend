import axios from 'axios';

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
      const url = new URL(req.url);
      queryParams = Object.fromEntries(url.searchParams.entries());
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
      // Create request config
      const API_BASE_URL = process.env.API_BASE_URL;
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL environment variable not defined');
      }

      // Configure the request
      const config = {
        method: req.method,
        url: `${API_BASE_URL}${targetPath}`,
        params: { ...queryParams },
        headers: {
          'Content-Type': 'application/json',
        },
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
          } catch (e) {
            // Handle case where body is not JSON or empty
            config.data = {};
          }
        } else {
          // Pages Router - body is directly available
          if (req.body) {
            config.data = req.body;
          }
        }
      }

      // Add API token if required (server-side only)
      if (requiresApiToken) {
        // Use server-side environment variable - not exposed to client
        const API_TOKEN = process.env.API_TOKEN;

        if (!API_TOKEN) {
          throw new Error('API_TOKEN environment variable not defined');
        } // Add the token to the request params
        config.params.token = API_TOKEN;
      }

      // Add JWT token if required
      if (requiresAuth) {
        let authHeader;

        if (context && context.params) {
          // App Router - get header from Request object
          authHeader = req.headers.get('authorization');
        } else {
          // Pages Router - get from req.headers object
          authHeader = req.headers.authorization;
        }
        if (authHeader) {
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
