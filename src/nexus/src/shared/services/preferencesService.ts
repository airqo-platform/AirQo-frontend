import { ApiClient, createAuthenticatedClient } from './apiClient';
import type {
  GetUserPreferencesResponse,
  UpdateUserPreferencesRequest,
  UpdateUserPreferencesResponse,
  UpdateUserThemeRequest,
  UpdateUserThemeResponse,
  GetGroupThemeResponse,
  GetUserThemeResponse,
  UpdateOrganizationGroupThemeRequest,
  UpdateOrganizationGroupThemeResponse,
  GetUserPreferencesListResponse,
  GroupChartListResponse,
  GroupChartDetailResponse,
  CreateGroupChartRequest,
  UpdateGroupChartRequest,
  GroupChartMutationResponse,
  ApiErrorResponse,
} from '../types/api';
import { syncClientSessionToken } from './sessionAuthToken';

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
    await syncClientSessionToken(this.authenticatedClient);
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

  // Update organization group theme
  async updateOrganizationGroupTheme(
    groupId: string,
    data: UpdateOrganizationGroupThemeRequest
  ): Promise<UpdateOrganizationGroupThemeResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.put<
        UpdateOrganizationGroupThemeResponse | ApiErrorResponse
      >(`/users/preferences/theme/organization/group/${groupId}`, {
        theme: data,
      });
      const result = response.data;

      if ('success' in result && !result.success) {
        throw this.createEnhancedError(
          result.message || 'Failed to update organization group theme',
          { status: response.status, data: result as ApiErrorResponse }
        );
      }

      return result as UpdateOrganizationGroupThemeResponse;
    } catch (error: unknown) {
      throw this.handleApiError(
        error,
        'Failed to update organization group theme'
      );
    }
  }

  // ── Group chart configurations ────────────────────────────────────────────
  // Contract verified live against staging (auth-service):
  //   GET    /users/preferences/groups/:grpId/charts           → list documents
  //   POST   /users/preferences/groups/:grpId/charts           → create (chartConfig wrapper)
  //   GET    /users/preferences/groups/:grpId/charts/:chartId  → single (flat config + site_ids/device_ids)
  //   PUT    /users/preferences/groups/:grpId/charts/:chartId  → partial update (FLAT body, no wrapper)
  //   DELETE /users/preferences/groups/:grpId/charts/:chartId  → delete

  // List all group chart configuration documents
  async getGroupCharts(groupId: string): Promise<GroupChartListResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        GroupChartListResponse | ApiErrorResponse
      >(`/users/preferences/groups/${groupId}/charts`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get group chart configurations',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GroupChartListResponse;
    } catch (error: unknown) {
      throw this.handleApiError(
        error,
        'Failed to get group chart configurations'
      );
    }
  }

  // Get a single chart configuration with its site/device scope
  async getGroupChart(
    groupId: string,
    chartId: string
  ): Promise<GroupChartDetailResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        GroupChartDetailResponse | ApiErrorResponse
      >(`/users/preferences/groups/${groupId}/charts/${chartId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get chart configuration',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GroupChartDetailResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get chart configuration');
    }
  }

  // Create a group chart configuration
  async createGroupChart(
    groupId: string,
    request: CreateGroupChartRequest
  ): Promise<GroupChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        GroupChartMutationResponse | ApiErrorResponse
      >(`/users/preferences/groups/${groupId}/charts`, request);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to create chart configuration',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GroupChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to create chart configuration');
    }
  }

  // Update a group chart configuration (flat partial body — verified live)
  async updateGroupChart(
    groupId: string,
    chartId: string,
    request: UpdateGroupChartRequest
  ): Promise<GroupChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.put<
        GroupChartMutationResponse | ApiErrorResponse
      >(`/users/preferences/groups/${groupId}/charts/${chartId}`, request);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to update chart configuration',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GroupChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to update chart configuration');
    }
  }

  // Delete a group chart configuration
  async deleteGroupChart(
    groupId: string,
    chartId: string
  ): Promise<GroupChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.delete<
        GroupChartMutationResponse | ApiErrorResponse
      >(`/users/preferences/groups/${groupId}/charts/${chartId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to delete chart configuration',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as GroupChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to delete chart configuration');
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
