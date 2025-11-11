/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
  createOpenClient,
} from '@/shared/services/apiClient';
import { getSession } from 'next-auth/react';
import type {
  GetThemeResponse,
  UpdateThemeRequest,
  UpdateThemeResponse,
  UpdateOrganizationGroupThemeRequest,
  UpdateOrganizationGroupThemeResponse,
  ApiErrorResponse,
} from '../types/api';

export class ThemeService {
  private authenticatedClient: ApiClient;
  private serverClient: ApiClient;
  private openClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
    this.serverClient = createServerClient();
    this.openClient = createOpenClient();
  }

  private async ensureAuthenticated() {
    const session = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (session as any)?.accessToken;
    if (token) {
      this.authenticatedClient.setAuthToken(token);
    }
  }

  // Get user theme - authenticated endpoint
  async getUserTheme(): Promise<GetThemeResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetThemeResponse | ApiErrorResponse
    >('/users/theme');
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(
        (data as ApiErrorResponse).message || 'Failed to get theme'
      );
    }

    return data as GetThemeResponse;
  }

  // Update user theme - authenticated endpoint
  async updateUserTheme(
    themeData: UpdateThemeRequest
  ): Promise<UpdateThemeResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdateThemeResponse | ApiErrorResponse
    >('/users/theme', themeData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(
        (data as ApiErrorResponse).message || 'Failed to update theme'
      );
    }

    return data as UpdateThemeResponse;
  }

  // Update organization group theme - authenticated endpoint
  async updateOrganizationGroupTheme(
    groupId: string,
    themeData: UpdateOrganizationGroupThemeRequest
  ): Promise<UpdateOrganizationGroupThemeResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdateOrganizationGroupThemeResponse | ApiErrorResponse
    >(
      `/api/v2/users/preferences/theme/organization/group/${groupId}`,
      themeData
    );
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(
        (data as ApiErrorResponse).message ||
          'Failed to update organization group theme'
      );
    }

    return data as UpdateOrganizationGroupThemeResponse;
  }
}

export const themeService = new ThemeService();
