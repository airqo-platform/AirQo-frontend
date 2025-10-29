import { removeTrailingSlash } from '@/utils';

import { EnhancedApiError, RequestConfig, ServiceResponse } from './base';

interface ApiClientConfig {
  baseURL: string;
  token?: string; // Not used anymore, token handled server-side
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private token?: string;
  private defaultTimeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = removeTrailingSlash(config.baseURL);
    this.token = config.token;
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
    } = config;

    // Build the full URL
    const fullUrl = this.buildUrl(url, params);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    // Note: Token is handled server-side by the internal API route

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => null);

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
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: EnhancedApiError = new Error('Request timeout');
        timeoutError.statusCode = 408;
        throw timeoutError;
      }
      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Build URL for the Next.js API proxy route
    // The proxy expects: /api/v2/{actual-api-path}
    // where actual-api-path is like "website/api/v2/publications/"

    let url: string;

    // If endpoint starts with /website/ or starts with website/, it's a full API path
    if (endpoint.startsWith('/website/') || endpoint.startsWith('website/')) {
      const cleanEndpoint = endpoint.startsWith('/')
        ? endpoint.slice(1)
        : endpoint;
      url = `${this.baseURL}/${cleanEndpoint}`;
    }
    // If endpoint starts with /api/ or api/, it's also a full API path
    else if (endpoint.startsWith('/api/') || endpoint.startsWith('api/')) {
      const cleanEndpoint = endpoint.startsWith('/')
        ? endpoint.slice(1)
        : endpoint;
      url = `${this.baseURL}/${cleanEndpoint}`;
    }
    // For other endpoints, treat as relative
    else {
      const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;
      url = `${this.baseURL}${normalizedEndpoint}`;
    }

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }
}

// Create the API client instance
const apiUrl = '/api/v2';

const apiClient = new ApiClient({
  baseURL: apiUrl,
  token: undefined,
  timeout: 30000,
});

export default apiClient;
