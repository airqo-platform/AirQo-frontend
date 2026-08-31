import { ApiClient, createAuthenticatedClient } from './apiClient';
import type {
  CreateSavedComparisonRequest,
  SavedComparisonListResponse,
  SavedComparisonListParams,
  SavedComparisonResponse,
  UpdateSavedComparisonRequest,
  ApiErrorResponse,
} from '../types/api';
import { syncClientSessionToken } from './sessionAuthToken';

interface EnhancedError extends Error {
  status: number;
  data: ApiErrorResponse | null;
  success: boolean;
}

export class ComparisonsService {
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

  // List saved comparisons for a group
  async list(
    params: SavedComparisonListParams
  ): Promise<SavedComparisonListResponse> {
    await this.ensureAuthenticated();
    try {
      const queryParams: Record<string, unknown> = {
        group_id: params.group_id,
      };
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.skip !== undefined) queryParams.skip = params.skip;
      if (params.search !== undefined) queryParams.search = params.search;

      const response = await this.authenticatedClient.get<
        SavedComparisonListResponse | ApiErrorResponse
      >('/users/comparisons', { params: queryParams });
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get saved comparisons',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as SavedComparisonListResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get saved comparisons');
    }
  }

  // Get a single saved comparison
  async get(comparisonId: string): Promise<SavedComparisonResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        SavedComparisonResponse | ApiErrorResponse
      >(`/users/comparisons/${comparisonId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to get saved comparison',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as SavedComparisonResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to get saved comparison');
    }
  }

  // Create a saved comparison
  async create(
    payload: CreateSavedComparisonRequest
  ): Promise<SavedComparisonResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        SavedComparisonResponse | ApiErrorResponse
      >('/users/comparisons', payload);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to create saved comparison',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as SavedComparisonResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to create saved comparison');
    }
  }

  // Update a saved comparison (partial)
  async update(
    comparisonId: string,
    payload: UpdateSavedComparisonRequest
  ): Promise<SavedComparisonResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.patch<
        SavedComparisonResponse | ApiErrorResponse
      >(`/users/comparisons/${comparisonId}`, payload);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw this.createEnhancedError(
          data.message || 'Failed to update saved comparison',
          { status: response.status, data: data as ApiErrorResponse }
        );
      }

      return data as SavedComparisonResponse;
    } catch (error: unknown) {
      throw this.handleApiError(error, 'Failed to update saved comparison');
    }
  }

  // Delete a saved comparison.
  // The backend returns 204 (empty body) or 404 (already deleted) — both are
  // treated as success. For 204, response.data is empty, so we must not crash
  // reading it. Other statuses yield a sanitized error.
  async remove(
    comparisonId: string
  ): Promise<{ success: boolean; message?: string }> {
    await this.ensureAuthenticated();
    try {
      await this.authenticatedClient.delete(
        `/users/comparisons/${comparisonId}`
      );
      return { success: true };
    } catch (error: unknown) {
      // An axios error whose response is 204 or 404 means the comparison is
      // gone — treat as success.
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
        isAxiosError?: boolean;
      };
      const status = axiosError?.response?.status;
      if (status === 204 || status === 404) {
        return { success: true };
      }
      throw this.handleApiError(error, 'Failed to delete saved comparison');
    }
  }
}

// Export singleton instance
export const comparisonsService = new ComparisonsService();
