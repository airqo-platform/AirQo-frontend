// Theme API Types
export interface ApiErrorResponse {
  message: string;
}

export interface ThemeData {
  primaryColor: string;
  mode: 'light' | 'dark' | 'system';
  interfaceStyle: 'default' | 'bordered';
  contentLayout: 'compact' | 'wide';
}

export interface GetThemeResponse {
  success: boolean;
  message: string;
  data: ThemeData;
  source: string;
}

export interface UpdateThemeRequest {
  theme: ThemeData;
}

export interface UpdateThemeResponse {
  success: boolean;
  message: string;
  data: ThemeData;
}

export interface UpdateOrganizationGroupThemeRequest {
  primaryColor: string;
  mode: 'light' | 'dark' | 'system';
  interfaceStyle: 'default' | 'bordered';
  contentLayout: 'compact' | 'wide';
}

export interface UpdateOrganizationGroupThemeResponse {
  success: boolean;
  message: string;
  data: ThemeData;
}
