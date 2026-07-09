export interface EnhancedApiError extends Error {
  statusCode?: number;
  response?: {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
  };
  retryable?: boolean;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  authToken?: string;
}
