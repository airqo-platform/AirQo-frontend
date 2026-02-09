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
  GetGroupJoinRequestsResponse,
  GetGroupDetailsResponse,
  SendGroupInviteRequest,
  SendGroupInviteResponse,
  UpdateGroupDetailsRequest,
  UpdateGroupDetailsResponse,
  GetUserStatisticsResponse,
  AcceptEmailInvitationRequest,
  AcceptEmailInvitationResponse,
  GetPendingInvitationsResponse,
  AcceptInvitationResponse,
  RejectInvitationResponse,
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

  // Get group join requests - authenticated endpoint
  async getGroupJoinRequests(
    groupId: string
  ): Promise<GetGroupJoinRequestsResponse> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        GetGroupJoinRequestsResponse | ApiErrorResponse
      >(`/users/requests/groups/${groupId}`);
      const data = response.data;

      if ('success' in data && !data.success) {
        throw new Error(data.message || 'Failed to get group join requests');
      }

      return data as GetGroupJoinRequestsResponse;
    } catch (error: any) {
      // If the error has response data with success: true, return it
      if (
        error.response?.data &&
        'success' in error.response.data &&
        error.response.data.success
      ) {
        return error.response.data as GetGroupJoinRequestsResponse;
      }
      throw error;
    }
  }

  // Get group details - authenticated endpoint
  async getGroupDetails(groupId: string): Promise<GetGroupDetailsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetGroupDetailsResponse | ApiErrorResponse
    >(`/users/groups/${groupId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get group details');
    }

    return data as GetGroupDetailsResponse;
  }

  // Send group invite - authenticated endpoint
  async sendGroupInvite(
    groupId: string,
    inviteData: SendGroupInviteRequest
  ): Promise<SendGroupInviteResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      SendGroupInviteResponse | ApiErrorResponse
    >(`/users/requests/emails/groups/${groupId}`, inviteData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to send group invite');
    }

    return data as SendGroupInviteResponse;
  }

  // Approve group join request - authenticated endpoint
  async approveGroupJoinRequest(
    requestId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      { success: boolean; message: string } | ApiErrorResponse
    >(`/users/requests/${requestId}/approve`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to approve group join request');
    }

    return data as { success: boolean; message: string };
  }

  // Approve group join request - public endpoint (for invitation links)
  async approveGroupJoinRequestPublic(
    requestId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.openClient.post<
      { success: boolean; message: string } | ApiErrorResponse
    >(`/users/requests/${requestId}/approve`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to approve group join request');
    }

    return data as { success: boolean; message: string };
  }

  // Accept email invitation - public endpoint
  async acceptEmailInvitation(
    request: AcceptEmailInvitationRequest
  ): Promise<AcceptEmailInvitationResponse> {
    const response = await this.openClient.post<
      AcceptEmailInvitationResponse | ApiErrorResponse
    >('/users/requests/emails/accept', request);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to accept email invitation');
    }

    return data as AcceptEmailInvitationResponse;
  }

  // Reject group join request - authenticated endpoint
  async rejectGroupJoinRequest(
    requestId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      { success: boolean; message: string } | ApiErrorResponse
    >(`/users/requests/${requestId}/reject`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to reject group join request');
    }

    return data as { success: boolean; message: string };
  }

  // Update group details - authenticated endpoint
  async updateGroupDetails(
    groupId: string,
    details: UpdateGroupDetailsRequest
  ): Promise<UpdateGroupDetailsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdateGroupDetailsResponse | ApiErrorResponse
    >(`/users/groups/${groupId}`, details);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update group details');
    }

    return data as UpdateGroupDetailsResponse;
  }

  // Get user statistics - authenticated endpoint
  async getUserStatistics(): Promise<GetUserStatisticsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetUserStatisticsResponse | ApiErrorResponse
    >('/users/stats');
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get user statistics');
    }

    return data as GetUserStatisticsResponse;
  }

  // Get pending invitations - authenticated endpoint
  async getPendingInvitations(): Promise<GetPendingInvitationsResponse> {
    try {
      await this.ensureAuthenticated();
      const response = await this.authenticatedClient.get<
        GetPendingInvitationsResponse | ApiErrorResponse
      >('/users/requests/pending/user');
      const data = response.data;

      if ('success' in data && !data.success) {
        throw new Error(data.message || 'Failed to get pending invitations');
      }

      return data as GetPendingInvitationsResponse;
    } catch (error: any) {
      // Handle 404 gracefully - the endpoint might not exist yet
      if (error.response?.status === 404) {
        console.warn('Pending invitations endpoint not found (404)');
        return {
          success: true,
          message: 'No invitations available',
          invitations: [],
        };
      }
      // Handle 401 gracefully - user not authenticated, return empty
      if (error.response?.status === 401) {
        console.warn('User not authenticated for pending invitations (401)');
        return {
          success: true,
          message: 'No invitations available',
          invitations: [],
        };
      }
      // For other errors, throw to be caught by the hook
      throw error;
    }
  }

  // Accept invitation - authenticated endpoint
  async acceptInvitation(
    invitationId: string
  ): Promise<AcceptInvitationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      AcceptInvitationResponse | ApiErrorResponse
    >(`/users/requests/pending/${invitationId}/accept`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to accept invitation');
    }

    return data as AcceptInvitationResponse;
  }

  // Reject invitation - authenticated endpoint
  async rejectInvitation(
    invitationId: string
  ): Promise<RejectInvitationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      RejectInvitationResponse | ApiErrorResponse
    >(`/users/requests/pending/${invitationId}/reject`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to reject invitation');
    }

    return data as RejectInvitationResponse;
  }
}

// Export singleton instance
export const userService = new UserService();
