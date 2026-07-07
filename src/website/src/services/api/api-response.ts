export type SupportedLanguage = 'en' | 'fr';

export interface ServiceResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  statusCode: number;
  headers?: Record<string, string>;
}

export interface ServiceOptions {
  language?: SupportedLanguage;
  timeout?: number;
  retryCount?: number;
  throwOnError?: boolean;
}
