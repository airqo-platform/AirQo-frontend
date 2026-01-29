import { removeTrailingSlash } from '@/utils';

import { EnhancedApiError, RequestConfig, ServiceResponse } from './base';

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
    } = config;

    // Build the full URL
    const fullUrl = this.buildUrl(url, params);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

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
    const isServerSide = typeof window === 'undefined';
    let url: string;

    if (isServerSide) {
      // Server-side: Direct backend API call
      // baseURL is already the full backend URL from environment variables
      // Endpoint already includes /api/v2/... so just append it
      const cleanEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;
      url = `${this.baseURL}${cleanEndpoint}`;
    } else {
      // Client-side: Use Next.js proxy
      // baseURL is /api/v2, endpoint should be relative path like 'devices/grids/summary'
      // We need to construct: /api/v2/devices/grids/summary

      if (endpoint.startsWith('/website/') || endpoint.startsWith('website/')) {
        // Website endpoints: /api/v2/website/api/v2/...
        const cleanEndpoint = endpoint.startsWith('/')
          ? endpoint.slice(1)
          : endpoint;
        url = `${this.baseURL}/${cleanEndpoint}`;
      } else {
        // Regular API endpoints: /api/v2/devices/grids/summary
        const normalizedEndpoint = endpoint.startsWith('/')
          ? endpoint
          : `/${endpoint}`;
        url = `${this.baseURL}${normalizedEndpoint}`;
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
