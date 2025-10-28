import { removeTrailingSlash } from '@/utils';

import { EnhancedApiError, RequestConfig, ServiceResponse } from './base';

interface ApiClientConfig {
  baseURL: string;
  token?: string;
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

    // Add API token if available
    let requestUrl = fullUrl;
    if (this.token) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      requestUrl = `${fullUrl}${separator}token=${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(requestUrl, {
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
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    let url = `${this.baseURL}${normalizedEndpoint}`;

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
const apiUrl = removeTrailingSlash(
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '',
);

const apiClient = new ApiClient({
  baseURL: apiUrl,
  token: process.env.API_TOKEN,
  timeout: 30000,
});

export default apiClient;
