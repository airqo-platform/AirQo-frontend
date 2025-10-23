import { ApiClient, createAuthenticatedClient } from './apiClient';
import type {
  GetUserPreferencesResponse,
  UpdateUserPreferencesRequest,
  UpdateUserPreferencesResponse,
  UpdateUserThemeRequest,
  UpdateUserThemeResponse,
  GetGroupThemeResponse,
  GetUserThemeResponse,
  GetUserPreferencesListResponse,
  ApiErrorResponse,
} from '../types/api';
import { getSession } from 'next-auth/react';

interface EnhancedError extends Error {
  status: number;
  data: ApiErrorResponse | null;
  success: boolean;
}

export class PreferencesService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    const session = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (session as any)?.accessToken;
    if (token) {
      this.authenticatedClient.setAuthToken(token);
    }
  }

  private createEnhancedError(
    message: string,
    response?: { status?: number; data?: unknown }
  ): EnhancedError {
    const enhancedError: EnhancedError = new Error(message) as EnhancedError;
    enhancedError.status = response?.status ?? 500;
    enhancedError.data = response?.data
      ? (response.data as ApiErrorResponse)
      : null;
    enhancedError.success = false;
    return enhancedError;
  }

  private handleApiError(
    error: unknown,
    defaultMessage: string
  ): EnhancedError {
    // Check if it's already an EnhancedError
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      'data' in error &&
      'success' in error
    ) {
      return error as EnhancedError;
    }

    // Handle axios error
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
      message?: string;
      isAxiosError?: boolean;
    };

    return this.createEnhancedError(
      axiosError?.message || defaultMessage,
      axiosError?.response
    );
  }

  // Get user preferences for current active group
  async getUserRecentPreferences(
    userId: string,
    groupId: string
  ): Promise<GetUserPreferencesResponse> {
    await this.ensureAuthenticated();
    try {
      // First, try to get group-specific preferences
      const response = await this.authenticatedClient.get<
        GetUserPreferencesResponse | ApiErrorResponse
      >(`/users/preferences/recent/${userId}?group_id=${groupId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        // If group-specific preferences don't exist, try without group context for backward compatibility
        if (data.message && data.message.includes('not found')) {
          try {
            const fallbackResponse = await this.authenticatedClient.get<
              GetUserPreferencesResponse | ApiErrorResponse
            >(`/users/preferences/${userId}`);
            const fallbackData = fallbackResponse.data;

            if ('success' in fallbackData && fallbackData.success) {
              return fallbackData as GetUserPreferencesResponse;
            }
          } catch {
            // If fallback also fails, throw the original error
          }
        }

        throw this.createEnhancedError(
          data.message || 'Failed to get user preferences',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GetUserPreferencesResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get user preferences');
    }
  }

  // Get user preferences list for a specific group
  async getUserPreferencesList(
    userId: string,
    groupId: string
  ): Promise<GetUserPreferencesListResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        GetUserPreferencesListResponse | ApiErrorResponse
      >(`/users/preferences/${userId}?group_id=${groupId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get user preferences list',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GetUserPreferencesListResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get user preferences list');
    }
  }

  // Update user preferences for a specific group
  async updateUserPreferences(
    data: UpdateUserPreferencesRequest
  ): Promise<UpdateUserPreferencesResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.patch<
        UpdateUserPreferencesResponse | ApiErrorResponse
      >('/users/preferences/replace', data);
      const result = response.data;

      if ('success' in result && !result.success) {
        throw this.createEnhancedError(
          result.message || 'Failed to update user preferences',
          { status: response.status, data: result as ApiErrorResponse }
        );
      }

      return result as UpdateUserPreferencesResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to update user preferences');
    }
  }

  // Update user theme setting
  async updateUserTheme(
    userId: string,
    groupId: string,
    data: UpdateUserThemeRequest
  ): Promise<UpdateUserThemeResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.put<
        UpdateUserThemeResponse | ApiErrorResponse
      >(`/users/preferences/theme/user/${userId}/group/${groupId}`, data);
      const result = response.data;

      if ('success' in result && !result.success) {
        throw this.createEnhancedError(
          result.message || 'Failed to update user theme',
          { status: response.status, data: result as ApiErrorResponse }
        );
      }

      return result as UpdateUserThemeResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to update user theme');
    }
  }

  // Get group's theme
  async getGroupTheme(groupId: string): Promise<GetGroupThemeResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        GetGroupThemeResponse | ApiErrorResponse
      >(`/users/preferences/theme/organization/group/${groupId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get group theme',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GetGroupThemeResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get group theme');
    }
  }

  // Get user's theme based on active group
  async getUserTheme(
    userId: string,
    groupId: string
  ): Promise<GetUserThemeResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        GetUserThemeResponse | ApiErrorResponse
      >(`/users/preferences/theme/user/${userId}/group/${groupId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get user theme',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GetUserThemeResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get user theme');
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
