import removeTrailingSlash from '@/lib/utils/removeTrailingSlash';

import { EnhancedApiError, RequestConfig } from './api-error';
import { ServiceResponse } from './api-response';

const isAbortError = (error: unknown): boolean =>
  (error instanceof Error && error.name === 'AbortError') ||
  (typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError');

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = removeTrailingSlash(config.baseURL);
    this.defaultTimeout = config.timeout || 30000;
  }

  async request<T>(
    config: RequestConfig & { timeout?: number },
  ): Promise<ServiceResponse<T>> {
    const {
      method,
      url,
      data,
      params,
      headers = {},
      timeout = this.defaultTimeout,
      signal: requestSignal,
    } = config;

    // Build the full URL
    const fullUrl = this.buildUrl(url, params);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    let externallyAborted = false;

    try {
      const controller = new AbortController();
      const handleExternalAbort = () => {
        externallyAborted = true;
        controller.abort();
      };

      if (requestSignal?.aborted) {
        handleExternalAbort();
      } else {
        requestSignal?.addEventListener('abort', handleExternalAbort, {
          once: true,
        });
      }

      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(fullUrl, {
          method,
          headers: requestHeaders,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
          // Network Coverage data must be read fresh after a registry write;
          // the proxy already owns the bounded server-side cache and invalidates
          // it after mutations.
          ...(fullUrl.includes('/api/v2/devices/network-coverage')
            ? { cache: 'no-store' as RequestCache }
            : {}),
        });

        let responseData: any = null;
        try {
          responseData = await response.json();
        } catch (error) {
          if (isAbortError(error)) throw error;
        }

        if (!response.ok) {
          const error: EnhancedApiError = new Error(
            `HTTP ${response.status}: ${response.statusText}`,
          );
          error.statusCode = response.status;
          error.response = {
            data: responseData,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
          };
          throw error;
        }

        return {
          data: responseData,
          success: true,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } finally {
        clearTimeout(timeoutId);
        requestSignal?.removeEventListener('abort', handleExternalAbort);
      }
    } catch (error) {
      if (isAbortError(error)) {
        if (externallyAborted) throw error;
        const timeoutError: EnhancedApiError = new Error('Request timeout');
        timeoutError.statusCode = 408;
        throw timeoutError;
      }
      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const isServerSide = typeof window === 'undefined';
    let url: string;

    if (isServerSide) {
      // Server-side: Direct backend API call
      // The server already receives full backend paths such as /website/api/v2/...
      const normalizedBaseURL = this.baseURL.replace(/\/$/, '');
      const cleanEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;
      url = `${normalizedBaseURL}${cleanEndpoint}`;
    } else {
      // Client-side: Use Next.js proxy
      // baseURL is /api/v2. Website endpoints are normalized to /api/v2/website/...
      // so we avoid repeating api/v2 in the browser URL while keeping the proxy path stable.

      const normalizeClientEndpoint = (value: string) => {
        const cleanValue = value.startsWith('/') ? value.slice(1) : value;

        return cleanValue.replace(/^website\/api\/v2\//, 'website/');
      };

      const normalizedEndpoint = normalizeClientEndpoint(endpoint);

      if (
        normalizedEndpoint.startsWith('website/') ||
        normalizedEndpoint.startsWith('api/v2/')
      ) {
        url = `${this.baseURL}/${normalizedEndpoint}`;
      } else {
        // Regular API endpoints: /api/v2/devices/grids/summary
        const cleanEndpoint = endpoint.startsWith('/')
          ? endpoint
          : `/${endpoint}`;
        url = `${this.baseURL}${cleanEndpoint}`;
      }
    }

    // Build query parameters
    const searchParams = new URLSearchParams();

    // Add token for server-side requests
    if (isServerSide) {
      const apiToken = process.env.API_TOKEN;
      if (apiToken) {
        searchParams.set('token', apiToken);
      }
    }

    // Add other params
    if (params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }
}

// Create the API client instance
// Use absolute backend URL on server-side (direct API calls with token)
// Use Next.js proxy on client-side (hides API from network tab)
const isServerSide = typeof window === 'undefined';
const apiUrl = isServerSide
  ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
  : '/api/v2';

if (isServerSide && !apiUrl) {
  throw new Error(
    'API_URL or NEXT_PUBLIC_API_URL environment variable is required for server-side API calls',
  );
}

const apiClient = new ApiClient({
  baseURL: apiUrl!,
  timeout: 30000,
});

export default apiClient;
