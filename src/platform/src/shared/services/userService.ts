/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
  createOpenClient,
} from './apiClient';
import { getSession } from 'next-auth/react';
import type {
  UserDetailsResponse,
  UserRolesResponse,
  ApiErrorResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
  UpdateUserDetailsRequest,
  UpdateUserDetailsResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  VerifyEmailResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  SlugAvailabilityResponse,
  InitiateAccountDeletionResponse,
  ConfirmAccountDeletionResponse,
} from '../types/api';

export class UserService {
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

  // Get user details - authenticated endpoint
  async getUserDetails(userId: string): Promise<UserDetailsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      UserDetailsResponse | ApiErrorResponse
    >(`/users/${userId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get user details');
    }

    return data as UserDetailsResponse;
  }

  // Get user roles and permissions - authenticated endpoint
  async getUserRoles(): Promise<UserRolesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      UserRolesResponse | ApiErrorResponse
    >('/users/roles/me/roles-simplified');
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get user roles');
    }

    return data as UserRolesResponse;
  }

  // Get user roles and permissions by user ID - authenticated endpoint
  async getUserRolesById(userId: string): Promise<UserRolesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      UserRolesResponse | ApiErrorResponse
    >(`/users/roles/users/${userId}/roles-simplified`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get user roles');
    }

    return data as UserRolesResponse;
  }

  // Update user preferences - authenticated endpoint
  async updatePreferencesAuthenticated(
    preferences: UpdatePreferencesRequest
  ): Promise<UpdatePreferencesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.patch<
      UpdatePreferencesResponse | ApiErrorResponse
    >('/users/preferences/replace', preferences);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update preferences');
    }

    return data as UpdatePreferencesResponse;
  }

  // Update user preferences - API token endpoint
  async updatePreferencesWithToken(
    preferences: UpdatePreferencesRequest
  ): Promise<UpdatePreferencesResponse> {
    const response = await this.serverClient.patch<
      UpdatePreferencesResponse | ApiErrorResponse
    >('/users/preferences/replace', preferences);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update preferences');
    }

    return data as UpdatePreferencesResponse;
  }

  // Update user details - open endpoint
  async updateUserDetails(
    userId: string,
    details: UpdateUserDetailsRequest
  ): Promise<UpdateUserDetailsResponse> {
    const response = await this.openClient.put<
      UpdateUserDetailsResponse | ApiErrorResponse
    >(`/users/${userId}`, details);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update user details');
    }

    return data as UpdateUserDetailsResponse;
  }

  // Update password - authenticated endpoint
  async updatePassword(
    userId: string,
    passwordData: UpdatePasswordRequest
  ): Promise<UpdatePasswordResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdatePasswordResponse | ApiErrorResponse
    >(`/users/updatePassword?id=${userId}`, passwordData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update password');
    }

    return data as UpdatePasswordResponse;
  }

  // Verify email - open endpoint
  async verifyEmail(
    userId: string,
    token: string
  ): Promise<VerifyEmailResponse> {
    const response = await this.openClient.get<
      VerifyEmailResponse | ApiErrorResponse
    >(`/users/verify/${userId}/${token}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to verify email');
    }

    return data as VerifyEmailResponse;
  }

  // Create organization request - authenticated endpoint
  async createOrganizationRequest(
    requestData: CreateOrganizationRequest
  ): Promise<CreateOrganizationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CreateOrganizationResponse | ApiErrorResponse
    >('/users/org-requests', requestData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to create organization request');
    }

    return data as CreateOrganizationResponse;
  }

  // Check slug availability - open endpoint
  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    const response = await this.openClient.get<
      SlugAvailabilityResponse | ApiErrorResponse
    >(`/users/org-requests/slug-availability/${slug}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to check slug availability');
    }

    return data as SlugAvailabilityResponse;
  }

  // Initiate account deletion - authenticated endpoint
  async initiateAccountDeletion(
    email: string
  ): Promise<InitiateAccountDeletionResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      InitiateAccountDeletionResponse | ApiErrorResponse
    >('/users/delete/initiate', { email });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to initiate account deletion');
    }

    return data as InitiateAccountDeletionResponse;
  }

  // Confirm account deletion - open endpoint
  async confirmAccountDeletion(
    token: string
  ): Promise<ConfirmAccountDeletionResponse> {
    const response = await this.openClient.post<
      ConfirmAccountDeletionResponse | ApiErrorResponse
    >(`/users/delete/confirm/${token}`);
    const data = response.data;

    // Return the data as is - let the caller check success field
    return data as ConfirmAccountDeletionResponse;
  }
}

// Export singleton instance
export const userService = new UserService();
