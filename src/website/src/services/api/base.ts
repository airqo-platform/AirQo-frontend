import apiClient from './api-client';
import { EnhancedApiError } from './api-error';
import { ServiceOptions, ServiceResponse } from './api-response';

export class BaseApiService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected async get<T>(
    url: string,
    params?: Record<string, any>,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>('GET', url, undefined, params, options);
  }

  protected async post<T>(
    url: string,
    data?: any,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>('POST', url, data, undefined, options);
  }

  protected async put<T>(
    url: string,
    data?: any,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>('PUT', url, data, undefined, options);
  }

  protected async patch<T>(
    url: string,
    data?: any,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>('PATCH', url, data, undefined, options);
  }

  protected async delete<T>(
    url: string,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    return this.request<T>('DELETE', url, undefined, undefined, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    params?: Record<string, any>,
    options: ServiceOptions = {},
  ): Promise<ServiceResponse<T>> {
    const { timeout, throwOnError = true, language } = options;

    const headers: Record<string, string> = {};

    if (language) {
      headers['Accept-Language'] = language;
    }

    try {
      const response = await apiClient.request<T>({
        method,
        url,
        data,
        params,
        headers,
        timeout,
      });

      return response;
    } catch (error) {
      if (throwOnError) {
        throw error;
      }

      const apiError = error as EnhancedApiError;

      return {
        data: null as T,
        success: false,
        message: apiError.message,
        statusCode: apiError.statusCode || 500,
      };
    }
  }

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

  protected transformPaginatedResponse<T extends Record<string, any>>(
    data: any,
  ): { data: T[]; pagination: any } {
    const results = data?.results || data?.data || [];
    const count = data?.count ?? 0;
    const pageSize = data?.page_size ?? results.length ?? 10;

    return {
      data: results,
      pagination: {
        page: data?.current_page ?? 1,
        limit: pageSize,
        total: count,
        pages: Math.max(1, Math.ceil(count / pageSize)),
        hasNext: !!data?.next,
        hasPrevious: !!data?.previous,
      },
    };
  }
}
