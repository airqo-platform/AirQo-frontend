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

  return async (req, res) => {
    // Extract the target path from the request
    const { path, ...queryParams } = req.query;
    const targetPath = Array.isArray(path) ? path.join('/') : path;

    // Only allow specified methods
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
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
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        config.data = req.body;
      }

      // Add API token if required (server-side only)
      if (requiresApiToken) {
        // Use server-side environment variable - not exposed to client
        const API_TOKEN = process.env.API_TOKEN;

        if (!API_TOKEN) {
          throw new Error('API_TOKEN environment variable not defined');
        }

        // Add the token to the request params
        config.params.token = API_TOKEN;
      }

      // Add JWT token if required
      if (requiresAuth && req.headers.authorization) {
        // Forward the authorization header from the client
        config.headers.Authorization = req.headers.authorization;
      }

      // Make the request
      const response = await axios(config);

      // Return the response
      return res.status(response.status).json(response.data);
    } catch (error) {
      // Forward error status code and message or fallback to generic error
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data || {
        success: false,
        message: 'An error occurred while processing the request',
      };

      return res.status(statusCode).json(errorMessage);
    }
  };
};
