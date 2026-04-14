import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import logger from '@/shared/lib/logger';
import {
  resolveApiOrigin,
  resolveVersionedApiPath,
} from '@/shared/lib/api-routing';
import { normalizeOAuthAccessToken } from '@/shared/lib/oauth-session';

const UNAUTHORIZED_EVENT_NAME = 'auth:unauthorized';
const UNAUTHORIZED_EVENT_COOLDOWN_MS = 1500;
const API_FAILURE_NOTIFY_COOLDOWN_MS = 10 * 60 * 1000;

const apiFailureNotificationCache = new Map<string, number>();
let hasLoggedMissingApiTokenWarning = false;

// Extended type for config with metadata
interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

interface UnauthorizedEventDetail {
  status: number;
  data: unknown;
  url?: string;
}

declare global {
  interface Window {
    __airqoUnauthorizedEventLastAt?: number;
  }
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

const dispatchUnauthorizedEvent = (detail: UnauthorizedEventDetail) => {
  if (typeof window === 'undefined') {
    return;
  }

  const now = Date.now();
  const lastEventAt = window.__airqoUnauthorizedEventLastAt || 0;
  if (now - lastEventAt < UNAUTHORIZED_EVENT_COOLDOWN_MS) {
    return;
  }

  window.__airqoUnauthorizedEventLastAt = now;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT_NAME, { detail }));
};

const shouldNotifyApiFailure = (key: string): boolean => {
  const now = Date.now();

  apiFailureNotificationCache.forEach((ts, cacheKey) => {
    if (now - ts > API_FAILURE_NOTIFY_COOLDOWN_MS) {
      apiFailureNotificationCache.delete(cacheKey);
    }
  });

  const lastNotifiedAt = apiFailureNotificationCache.get(key);
  if (lastNotifiedAt && now - lastNotifiedAt < API_FAILURE_NOTIFY_COOLDOWN_MS) {
    return false;
  }

  apiFailureNotificationCache.set(key, now);
  return true;
};

const resolveApiToken = (): string => {
  return (process.env.API_TOKEN || '').trim();
};

// Auth types
export enum AuthType {
  NONE = 'none',
  JWT = 'jwt', // From next-auth session
  API_TOKEN = 'api_token', // Adds token query param for token-authenticated endpoints
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
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private buildBaseUrl(): string {
    if (this.authType === AuthType.API_TOKEN) {
      if (typeof window !== 'undefined') {
        return '/api/external';
      }

      return resolveApiOrigin();
    }

    if (typeof window !== 'undefined') {
      return '';
    }

    return resolveApiOrigin();
  }

  private setupInterceptors() {
    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      async config => {
        // Add metadata for timing
        (config as RequestConfigWithMetadata).metadata = {
          startTime: Date.now(),
        };

        if (typeof config.url === 'string') {
          config.url = resolveVersionedApiPath(config.url);
        }

        // Log outgoing requests at debug level (dev only)
        // Only compute expensive data size when debug logging is actually enabled
        // API request logging removed to reduce console noise

        if (this.authType === AuthType.JWT) {
          // JWT tokens are set via setAuthToken() method
          // The Authorization header should already be set on the client defaults
        } else if (this.authType === AuthType.API_TOKEN) {
          if (typeof window === 'undefined') {
            const apiToken = resolveApiToken();

            if (apiToken) {
              const existingParams =
                config.params && typeof config.params === 'object'
                  ? config.params
                  : {};
              config.params = {
                ...existingParams,
                token: apiToken,
              };
            } else if (!apiToken && !hasLoggedMissingApiTokenWarning) {
              hasLoggedMissingApiTokenWarning = true;
              logger.warn(
                'API token client is active but no token is configured. Set API_TOKEN in server environment variables.'
              );
            }
          }
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
        // Only compute expensive data size when debug logging is actually enabled
        // API response logging removed to reduce console noise

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
          duration: error.config?.metadata?.startTime
            ? Date.now() - error.config.metadata.startTime
            : undefined,
          // Sanitize request data - avoid logging sensitive info
          hasRequestData: !!error.config?.data,
          requestDataSize: error.config?.data
            ? safeStringify(error.config.data, 500).length
            : 0,
        };

        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'unknown-url';
        const status = error.response?.status;
        const errorCode = error.code || 'no-code';
        const notifyKey = `${method}:${url}:${status || errorCode}`;
        const canNotify = shouldNotifyApiFailure(notifyKey);

        if (error.response?.status === 401) {
          // 401 Unauthorized - expected behavior, don't send to Slack
          // Log at warn level for debugging purposes only
          logger.warn('Unauthorized API access', {
            ...errorContext,
            message: 'Session may have expired or insufficient permissions',
          });

          // Dispatch event with error details for smart handling
          dispatchUnauthorizedEvent({
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          });
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
          if (canNotify) {
            logger.critical('API server error occurred', apiError, {
              ...errorContext,
              responseData: error.response.data,
            });
          } else {
            logger.error('Suppressed duplicate API server error notification', {
              ...errorContext,
              responseData: error.response.data,
            });
          }
        } else if (error.response?.status === 429) {
          // 429 Rate Limit - warn but don't spam Slack
          logger.warn('API rate limit exceeded', {
            ...errorContext,
            retryAfter: error.response.headers?.['retry-after'],
          });
        } else if (error.response?.status >= 400) {
          // Other 4xx Client errors - log locally but only send serious ones to Slack
          // Avoid sending validation errors (400, 422) to Slack in production
          const status = error.response.status;
          if (status === 409) {
            // 409 Conflict is often an expected business-rule outcome
            // (e.g. duplicate account/email) and should not page on-call.
            logger.warn('API conflict response', {
              ...errorContext,
              responseData: error.response.data,
            });
            return Promise.reject(error);
          }

          const shouldNotifySlack =
            status >= 405 && // Skip validation errors (400, 404 already handled)
            status !== 429; // Skip rate limiting (already handled)

          if (shouldNotifySlack) {
            const apiError = new Error(
              `API Client Error: ${status} ${error.response.statusText}`
            );
            apiError.name = 'APIClientError';
            if (canNotify) {
              logger.errorWithSlack('API client error occurred', apiError, {
                ...errorContext,
                responseData: error.response.data,
              });
            } else {
              logger.error(
                'Suppressed duplicate API client error notification',
                {
                  ...errorContext,
                  responseData: error.response.data,
                }
              );
            }
          } else {
            // Log validation and expected errors locally only
            logger.warn('API validation error', {
              ...errorContext,
              responseData: error.response.data,
            });
          }
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          // Network errors - critical infrastructure issues, notify Slack
          const networkError = new Error(
            `Network error: ${error.message || 'Unable to reach API'}`
          );
          networkError.name = 'APINetworkError';
          if (canNotify) {
            logger.errorWithSlack(
              'API network error occurred',
              networkError,
              errorContext
            );
          } else {
            logger.error(
              'Suppressed duplicate API network error notification',
              {
                ...errorContext,
                errorCode,
              }
            );
          }
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
    const normalizedToken = normalizeOAuthAccessToken(token);
    if (!normalizedToken) {
      this.removeAuthToken();
      return;
    }
    const cleanToken = `Bearer ${normalizedToken}`;
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
