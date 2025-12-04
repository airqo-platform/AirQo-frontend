import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import logger from '@/shared/lib/logger';

// Extended type for config with metadata
interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

// Safe JSON stringification to prevent circular reference errors and memory leaks
const safeStringify = (obj: unknown, maxLength = 1000): string => {
  try {
    const seen = new WeakSet();
    const result = JSON.stringify(
      obj,
      (key, value) => {
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        // Redact sensitive keys
        if (
          typeof key === 'string' &&
          /password|token|secret|authorization|api[-_]?key/i.test(key)
        ) {
          return '[REDACTED]';
        }
        return value;
      },
      2
    );
    // Truncate if too long to prevent memory issues
    return result.length > maxLength
      ? result.substring(0, maxLength) + '... [truncated]'
      : result;
  } catch {
    return '[Unstringifiable]';
  }
};

// Auth types
export enum AuthType {
  NONE = 'none',
  JWT = 'jwt', // From next-auth session
  API_TOKEN = 'api_token', // From env, server-side only
}

// Base API client class
export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private authType: AuthType;

  constructor(authType: AuthType = AuthType.NONE) {
    this.authType = authType;
    this.baseUrl = this.buildBaseUrl();

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private buildBaseUrl(): string {
    if (this.authType === AuthType.API_TOKEN) {
      // For API_TOKEN, use internal proxy route
      return '/api/external';
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;
    if (!baseUrl) {
      throw new Error('API_BASE_URL is not defined in environment variables');
    }

    // Remove trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    if (cleanBaseUrl.endsWith('/api/v2')) {
      return cleanBaseUrl;
    }

    // If it doesn't end with /api/v2, add it
    return `${cleanBaseUrl}/api/v2`;
  }

  private setupInterceptors() {
    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      async config => {
        // Add metadata for timing
        (config as RequestConfigWithMetadata).metadata = {
          startTime: Date.now(),
        };

        // Log outgoing requests at debug level (dev only)
        logger.debug('API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          timeout: config.timeout,
          hasData: !!config.data,
          dataSize: config.data ? safeStringify(config.data).length : 0,
        });

        if (this.authType === AuthType.JWT) {
          // JWT tokens are set via setAuthToken() method
          // The Authorization header should already be set on the client defaults
        } else if (this.authType === AuthType.API_TOKEN) {
          // Token is handled by the internal proxy route
        }
        return config;
      },
      error => {
        logger.error('API Request failed to send', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => {
        // Log successful responses at debug level (dev only)
        logger.debug('API Response Success', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          statusText: response.statusText,
          duration:
            Date.now() -
            ((response.config as RequestConfigWithMetadata).metadata
              ?.startTime || Date.now()),
          dataSize: safeStringify(response.data).length,
        });

        return response;
      },
      error => {
        // Build comprehensive error context for logging
        // Use safe stringification to prevent circular reference errors and memory leaks
        const errorContext = {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
          duration: error.config?.metadata?.startTime
            ? Date.now() - error.config.metadata.startTime
            : undefined,
          // Sanitize request data - avoid logging sensitive info
          hasRequestData: !!error.config?.data,
          requestDataSize: error.config?.data
            ? safeStringify(error.config.data, 500).length
            : 0,
        };

        if (error.response?.status === 401) {
          // 401 Unauthorized - expected behavior, don't send to Slack
          // Log at warn level for debugging purposes only
          logger.warn('Unauthorized API access', {
            ...errorContext,
            message: 'Session may have expired or insufficient permissions',
          });

          // Dispatch event with error details for smart handling
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('auth:unauthorized', {
                detail: {
                  status: error.response.status,
                  data: error.response.data,
                  url: error.config?.url,
                },
              })
            );
          }
        } else if (error.response?.status === 403) {
          // 403 Forbidden - permission issue, log but don't spam Slack
          logger.warn('Forbidden API access', {
            ...errorContext,
            message: 'User lacks required permissions',
          });
        } else if (error.response?.status === 404) {
          // 404 Not Found - could be expected behavior, log at debug level
          logger.debug('API resource not found', errorContext);
        } else if (error.response?.status >= 500) {
          // 5xx Server errors - CRITICAL, always notify
          // These indicate backend issues that need immediate attention
          const apiError = new Error(
            `API Server Error: ${error.response.status} ${error.response.statusText}`
          );
          apiError.name = 'APIServerError';
          logger.critical('API server error occurred', apiError, {
            ...errorContext,
            responseData: error.response.data,
          });
        } else if (error.response?.status === 429) {
          // 429 Rate Limit - warn but don't spam Slack
          logger.warn('API rate limit exceeded', {
            ...errorContext,
            retryAfter: error.response.headers?.['retry-after'],
          });
        } else if (error.response?.status >= 400) {
          // Other 4xx Client errors - log locally but only send serious ones to Slack
          // Avoid sending validation errors (400, 422) to Slack in production
          const shouldNotifySlack =
            error.response.status >= 405 && // Skip validation errors (400, 404 already handled)
            error.response.status !== 408 && // Skip request timeout (client-side)
            error.response.status !== 429; // Skip rate limiting (already handled)

          if (shouldNotifySlack) {
            const apiError = new Error(
              `API Client Error: ${error.response.status} ${error.response.statusText}`
            );
            apiError.name = 'APIClientError';
            logger.errorWithSlack('API client error occurred', apiError, {
              ...errorContext,
              responseData: error.response.data,
            });
          } else {
            // Log validation and expected errors locally only
            logger.warn('API validation error', {
              ...errorContext,
              responseData: error.response.data,
            });
          }
        } else if (
          error.code === 'ECONNABORTED' ||
          error.message?.includes('timeout')
        ) {
          // Timeout errors - notify Slack as these are serious connectivity issues
          const timeoutError = new Error(
            `API request timeout: ${error.config?.timeout}ms`
          );
          timeoutError.name = 'APITimeoutError';
          logger.errorWithSlack(
            'API request timed out',
            timeoutError,
            errorContext
          );
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          // Network errors - critical infrastructure issues, notify Slack
          const networkError = new Error(
            `Network error: ${error.message || 'Unable to reach API'}`
          );
          networkError.name = 'APINetworkError';
          logger.errorWithSlack(
            'API network error occurred',
            networkError,
            errorContext
          );
        } else {
          // Unknown/other errors - log but evaluate if Slack notification is needed
          const otherError = new Error(`API error: ${error.message}`);
          otherError.name = 'APIError';
          logger.error('Unexpected API error occurred', {
            ...errorContext,
            errorCode: error.code,
            errorMessage: error.message,
          });

          // Only send truly unexpected errors to Slack
          if (error.code && error.code !== 'ERR_CANCELED') {
            logger.errorWithSlack(
              'Unexpected API error',
              otherError,
              errorContext
            );
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Method to add JWT token for authenticated requests
  setAuthToken(token: string) {
    // Handle edge case where token might already have "JWT " prefix
    const cleanToken = token.startsWith('JWT ') ? token : `JWT ${token}`;
    this.client.defaults.headers.common['Authorization'] = cleanToken;
  }

  // Get current auth token
  getAuthToken(): string | undefined {
    return this.client.defaults.headers.common['Authorization'] as string;
  }

  // Remove auth token
  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Factory functions for different clients
export const createOpenClient = () => new ApiClient(AuthType.NONE);
export const createAuthenticatedClient = () => new ApiClient(AuthType.JWT);
export const createServerClient = () => new ApiClient(AuthType.API_TOKEN);
