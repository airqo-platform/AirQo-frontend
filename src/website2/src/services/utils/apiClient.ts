import { ApiError } from './errors';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class SecureApiClient {
  private baseUrl: string;

  constructor() {
    // Use relative URL to hit our Next.js API proxy
    this.baseUrl = '/api/v2';
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    // Use origin-relative URL so SWR fetcher can accept full path or relative
    const url = new URL(
      `${this.baseUrl}/${endpoint}`,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost',
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...fetchOptions,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP error! status: ${response.status}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error occurred', 0, error);
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions,
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        ...fetchOptions,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP error! status: ${response.status}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error occurred', 0, error);
    }
  }
}

export const apiClient = new SecureApiClient();

export default SecureApiClient;
