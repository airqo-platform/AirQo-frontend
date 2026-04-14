export type SupportedLanguage = 'en' | 'fr';

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ServiceResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  statusCode: number;
  headers?: Record<string, string>;
}

export interface EnhancedApiError extends Error {
  statusCode?: number;
  response?: {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
  };
  retryable?: boolean;
}

export interface ServiceOptions {
  language?: SupportedLanguage;
  timeout?: number;
  retryCount?: number;
  throwOnError?: boolean;
}

/**
 * Base API Service
 *
 * Provides common functionality for all API services including error handling,
 * response transformation, and consistent patterns.
 */

import apiClient from './apiClient';

export abstract class BaseApiService {
  protected serviceName: string;
  protected defaultOptions: ServiceOptions;

  constructor(serviceName: string, defaultOptions: ServiceOptions = {}) {
    this.serviceName = serviceName;
    this.defaultOptions = {
      language: 'en',
      timeout: 30000,
      retryCount: 3,
      throwOnError: true,
      ...defaultOptions,
    };
  }

  /**
   * Generic HTTP request method with enhanced error handling
   */
  protected async request<T>(
    config: RequestConfig,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const response = await apiClient.request({
        ...config,
        timeout: mergedOptions.timeout,
      });

      // Return the response directly since apiClient.request already returns ServiceResponse
      return response as ServiceResponse<T>;
    } catch (error) {
      // Pass the full request config to handleError so retries can reuse the original method
      return this.handleError<T>(error, config, mergedOptions);
    }
  }

  /**
   * GET request helper
   */
  protected async get<T>(
    url: string,
    params?: Record<string, any>,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>(
      {
        method: 'GET',
        url,
        params,
      },
      options,
    );
  }

  /**
   * POST request helper
   */
  protected async post<T>(
    url: string,
    data?: any,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>(
      {
        method: 'POST',
        url,
        data,
      },
      options,
    );
  }

  /**
   * PUT request helper
   */
  protected async put<T>(
    url: string,
    data?: any,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>(
      {
        method: 'PUT',
        url,
        data,
      },
      options,
    );
  }

  /**
   * PATCH request helper
   */
  protected async patch<T>(
    url: string,
    data?: any,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>(
      {
        method: 'PATCH',
        url,
        data,
      },
      options,
    );
  }

  /**
   * DELETE request helper
   */
  protected async delete<T>(
    url: string,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>(
      {
        method: 'DELETE',
        url,
      },
      options,
    );
  }

  /**
   * Enhanced error handling with context
   */
  private async handleError<T>(
    error: any,
    configOrEndpoint: RequestConfig | string,
    options: ServiceOptions,
  ): Promise<ServiceResponse<T>> {
    const enhancedError = error as EnhancedApiError;
    const statusCode =
      enhancedError.statusCode || enhancedError.response?.status || 500;
    // Determine endpoint and original request config
    const originalConfig: RequestConfig =
      typeof configOrEndpoint === 'string'
        ? ({ method: 'GET', url: configOrEndpoint } as RequestConfig)
        : configOrEndpoint;

    // Extract error message from API response data first, fallback to generic messages
    let errorMessage = '';

    if (enhancedError.response?.data) {
      const responseData = enhancedError.response.data;
      // Try different common error message fields in the response
      errorMessage =
        responseData.error ||
        responseData.message ||
        responseData.detail ||
        responseData.details?.message ||
        '';
    }

    // If no specific error message found, use generic status code message
    if (!errorMessage) {
      errorMessage = `API Error: ${statusCode}`;
    }

    // Log error for debugging only in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[${this.serviceName}] API Error:`, {
        endpoint: originalConfig.url,
        method: originalConfig.method,
        statusCode,
        message: errorMessage,
      });
    }

    // Determine if error should be retried
    const method = (originalConfig.method || 'GET').toUpperCase();
    const isIdempotent =
      method === 'GET' ||
      method === 'HEAD' ||
      method === 'OPTIONS' ||
      method === 'DELETE' ||
      method === 'PUT';
    const shouldRetry =
      enhancedError.retryable && isIdempotent && (options.retryCount || 0) > 0;

    if (shouldRetry) {
      // Implement exponential backoff
      const delay = Math.min(
        1000 * Math.pow(2, 3 - (options.retryCount || 0)),
        10000,
      );
      await this.delay(delay);

      // Retry using the original request config (preserves method, url, and data)
      return this.request<T>(originalConfig, {
        ...options,
        retryCount: (options.retryCount || 0) - 1,
      });
    }

    const serviceError: ServiceResponse<T> = {
      data: null as any,
      success: false,
      message: errorMessage,
      statusCode,
      headers: enhancedError.response?.headers as Record<string, string>,
    };

    if (options.throwOnError) {
      throw new Error(errorMessage);
    }

    return serviceError;
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrlWithParams(
    baseUrl: string,
    params?: Record<string, any>,
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Transform paginated response
   */
  protected transformPaginatedResponse<T>(response: any): {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  } {
    // Handle different pagination response formats
    if (response.results && response.count) {
      // Django REST framework style
      const page = response.page || 1;
      const limit = response.limit || response.results.length;
      const total = response.count;
      const pages = Math.ceil(total / limit);

      return {
        data: response.results,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrevious: page > 1,
        },
      };
    }

    if (response.data && response.pagination) {
      // Standard format
      return {
        data: response.data,
        pagination: {
          ...response.pagination,
          hasNext: response.pagination.page < response.pagination.pages,
          hasPrevious: response.pagination.page > 1,
        },
      };
    }

    // Fallback - assume all data is on one page
    const data = Array.isArray(response) ? response : response.data || [];
    return {
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        pages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
}

export default BaseApiService;
