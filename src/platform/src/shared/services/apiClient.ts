import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
        if (this.authType === AuthType.JWT) {
          // JWT tokens are set via setAuthToken() method
          // The Authorization header should already be set on the client defaults
        } else if (this.authType === AuthType.API_TOKEN) {
          // Token is handled by the internal proxy route
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized - check if it's session expiry vs permissions
          console.error('Unauthorized access - checking session validity');

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
