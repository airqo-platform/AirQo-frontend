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
  ChartListResponse,
  ChartDetailResponse,
  CreateChartRequest,
  UpdateChartRequest,
  ChartMutationResponse,
  ApiErrorResponse,
} from '../types/api';
import { syncClientSessionToken } from './sessionAuthToken';

interface EnhancedError extends Error {
  status: number;
  data: ApiErrorResponse | null;
  success: boolean;
}

// The preferences API persists the chart configuration using its supported
// server types. Area remains a UI presentation choice and is rendered from
// the same line series on the client.
const normalizeChartTypeForApi = (chartType?: string): string | undefined =>
  chartType?.toLowerCase() === 'area' ? 'Line' : chartType;

const DEFAULT_CHART_PERIOD = { label: 'Selected date range' };

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

  /**
   * Build an EnhancedError whose message is a fixed, safe string even when the
   * caller supplies a backend-provided diagnostic. The backend text is
   * preserved as a non-enumerable `cause` so it remains visible to logs and
   * debuggers but can never be rendered in the UI (messages read via
   * `getUserFriendlyErrorMessage` only see the fixed message).
   */
  private createSanitizedError(
    stableMessage: string,
    backendMessage: string | undefined,
    response?: { status?: number; data?: unknown }
  ): EnhancedError {
    const enhancedError = this.createEnhancedError(stableMessage, response);
    const diagnostic =
      backendMessage && backendMessage !== stableMessage
        ? backendMessage
        : undefined;
    const causePayload =
      diagnostic !== undefined ? { diagnostic, response } : response;
    if (causePayload !== undefined) {
      Object.defineProperty(enhancedError, 'cause', {
        value: causePayload,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
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

    // Handle axios error. Raw axios errors can carry server-internal wording
    // (e.g. "timeout of 30000ms exceeded", unmatched backend diagnostics) that
    // must never reach the UI as an Error message. Throw a stable, safe
    // message and attach the original as a non-enumerable `cause` so logs and
    // debuggers can still see it.
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
      message?: string;
      isAxiosError?: boolean;
    };

    const stableMessage = defaultMessage;
    const enhancedError = this.createEnhancedError(
      stableMessage,
      axiosError?.response
    );
    if (error !== undefined && error !== null) {
      Object.defineProperty(enhancedError, 'cause', {
        value: error,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
    return enhancedError;
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

  // ── User chart configurations ──────────────────────────────────────────────
  // Contract verified live against staging (auth-service v2):
  //   GET    /users/preferences/charts[?group_id=]      → list flat chart docs
  //   GET    /users/preferences/charts/:chartId         → single flat chart doc
  //   POST   /users/preferences/charts                  → create (chartConfig wrapper)
  //   PUT    /users/preferences/charts/:chartId         → partial update (FLAT body)
  //   POST   /users/preferences/charts/:chartId/copy    → duplicate (title "(Copy)")
  //   DELETE /users/preferences/charts/:chartId         → delete
  // Charts are user-scoped; `group_id` narrows to a group and defaults to the
  // user's default group when omitted.

  // List the user's chart configurations
  async getCharts(groupId?: string): Promise<ChartListResponse> {
    await this.ensureAuthenticated();
    try {
      const query = groupId ? `?group_id=${encodeURIComponent(groupId)}` : '';
      const response = await this.authenticatedClient.get<
        ChartListResponse | ApiErrorResponse
      >(`/users/preferences/charts${query}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        // Never propagate backend-supplied diagnostic text into the thrown
        // Error message (it would otherwise reach the UI via
        // `getUserFriendlyErrorMessage`). Use a fixed, safe message; keep the
        // backend text as a non-enumerable `cause` for logging/debugging.
        throw this.createSanitizedError(
          'Failed to load chart configurations',
          typeof data.message === 'string' ? data.message : undefined,
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as ChartListResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to load chart configurations');
    }
  }

  // Get a single chart configuration with its site/device scope
  async getChart(chartId: string): Promise<ChartDetailResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        ChartDetailResponse | ApiErrorResponse
      >(`/users/preferences/charts/${chartId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createSanitizedError(
          'Failed to load chart configuration',
          typeof data.message === 'string' ? data.message : undefined,
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as ChartDetailResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to load chart configuration');
    }
  }

  // Create a chart configuration
  async createChart(
    request: CreateChartRequest
  ): Promise<ChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const normalizedRequest: CreateChartRequest = {
        ...request,
        period: request.period ?? DEFAULT_CHART_PERIOD,
        chartConfig: {
          ...request.chartConfig,
          chartType:
            normalizeChartTypeForApi(request.chartConfig.chartType) ?? 'Line',
        },
      };
      const response = await this.authenticatedClient.post<
        ChartMutationResponse | ApiErrorResponse
      >('/users/preferences/charts', normalizedRequest);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createSanitizedError(
          'Failed to create chart configuration',
          typeof data.message === 'string' ? data.message : undefined,
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as ChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to create chart configuration');
    }
  }

  // Update a chart configuration (flat partial body — verified live)
  async updateChart(
    chartId: string,
    request: UpdateChartRequest
  ): Promise<ChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const normalizedRequest: UpdateChartRequest = {
        ...request,
        period: request.period ?? DEFAULT_CHART_PERIOD,
        ...(request.chartType
          ? { chartType: normalizeChartTypeForApi(request.chartType) }
          : {}),
      };
      const response = await this.authenticatedClient.put<
        ChartMutationResponse | ApiErrorResponse
      >(`/users/preferences/charts/${chartId}`, normalizedRequest);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createSanitizedError(
          'Failed to update chart configuration',
          typeof data.message === 'string' ? data.message : undefined,
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as ChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to update chart configuration');
    }
  }

  // Duplicate a chart configuration (includes device_ids/site_ids/locationColors)
  async copyChart(chartId: string): Promise<ChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        ChartMutationResponse | ApiErrorResponse
      >(`/users/preferences/charts/${chartId}/copy`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createSanitizedError(
          'Failed to copy chart configuration',
          typeof data.message === 'string' ? data.message : undefined,
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as ChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to copy chart configuration');
    }
  }

  // Delete a chart configuration
  async deleteChart(chartId: string): Promise<ChartMutationResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.delete<
        ChartMutationResponse | ApiErrorResponse
      >(`/users/preferences/charts/${chartId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createSanitizedError(
          'Failed to delete chart configuration',
          typeof data.message === 'string' ? data.message : undefined,
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as ChartMutationResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to delete chart configuration');
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
