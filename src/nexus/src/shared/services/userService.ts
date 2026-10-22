/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
  createOpenClient,
} from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  UserDetailsResponse,
  UserRolesResponse,
  ApiErrorResponse,
  GetRolesSummaryResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
  UpdateUserDetailsRequest,
  UpdateUserDetailsResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  SetPasswordRequest,
  SetPasswordResponse,
  VerifyEmailResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  InitiateAccountDeletionResponse,
  ConfirmAccountDeletionResponse,
  GetGroupJoinRequestsResponse,
  GetGroupDetailsResponse,
  DiscoverGroupsResponse,
  RequestGroupAccessResponse,
  SendGroupInviteRequest,
  SendGroupInviteResponse,
  UpdateGroupDetailsRequest,
  UpdateGroupDetailsResponse,
  GetUserStatisticsResponse,
  UserStatsBreakdownResponse,
  UserStatsExportResponse,
  UserStatsExportSegment,
  GetUsersResponse,
  AcceptEmailInvitationRequest,
  AcceptEmailInvitationResponse,
  GetPendingInvitationsResponse,
  AcceptInvitationResponse,
  RejectInvitationResponse,
  UnassignUserFromGroupResponse,
  LeaveGroupResponse,
  SetGroupManagerResponse,
  UpdateGroupTitleRequest,
  UpdateGroupTitleResponse,
  UpdateUserRoleResponse,
  GetGroupsSummaryParams,
  GetGroupsSummaryResponse,
  GroupSummary,
  GetGroupAssignedUsersResponse,
  UnassignManyUsersFromGroupRequest,
  UnassignManyUsersFromGroupResponse,
  DeleteGroupResponse,
  GetGroupActivityLogParams,
  GetGroupActivityLogResponse,
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
    await syncClientSessionToken(this.authenticatedClient);
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

  // Get all roles and permissions summary - authenticated endpoint.
  // The backend ignores `page` and pages on `skip` instead, so the page/limit
  // call signature is translated into the skip/limit contract it honors.
  async getRolesSummary(
    page = 1,
    limit = 100
  ): Promise<GetRolesSummaryResponse> {
    await this.ensureAuthenticated();
    const skip = (page - 1) * limit;
    const response = await this.authenticatedClient.get<
      GetRolesSummaryResponse | ApiErrorResponse
    >(`/users/roles/summary?skip=${skip}&limit=${limit}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get roles summary');
    }

    return data as GetRolesSummaryResponse;
  }

  // Get all roles and permissions summary across all pages - authenticated
  // endpoint. Defensive against older deployments (and the live staging API)
  // that ignores `page` and returns the same first page repeatedly: pages are
  // deduplicated by `_id` (first-seen order preserved) and meta is normalized
  // to a single page holding the unique set.
  async getAllRolesSummary(limit = 100): Promise<GetRolesSummaryResponse> {
    const firstPage = await this.getRolesSummary(1, limit);
    const roles = [...firstPage.roles];

    const totalPages = firstPage.meta.pages || 1;
    for (let page = 2; page <= totalPages; page += 1) {
      const nextPage = await this.getRolesSummary(page, limit);
      roles.push(...nextPage.roles);
    }

    const seenRoleIds = new Set<string>();
    const uniqueRoles = roles.filter(role => {
      if (seenRoleIds.has(role._id)) return false;
      seenRoleIds.add(role._id);
      return true;
    });

    return {
      ...firstPage,
      meta: {
        ...firstPage.meta,
        total: uniqueRoles.length,
        page: 1,
        pages: 1,
        skip: 0,
        limit: uniqueRoles.length || firstPage.meta.limit,
      },
      roles: uniqueRoles,
    };
  }

  // Update a user's role - authenticated endpoint
  async updateUserRole(
    userId: string,
    roleId: string
  ): Promise<UpdateUserRoleResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdateUserRoleResponse | ApiErrorResponse
    >(`/users/roles/${roleId}/user/${userId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update user role');
    }

    return data as UpdateUserRoleResponse;
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

  // Set password for OAuth-authenticated users - authenticated endpoint
  async setPassword(
    passwordData: SetPasswordRequest
  ): Promise<SetPasswordResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      SetPasswordResponse | ApiErrorResponse
    >('/users/setPassword?tenant=airqo', passwordData);
    const data = response.data;

    if ('success' in data && !data.success) {
      const candidateErrors = (data as { errors?: unknown }).errors;
      const errorMessage = Array.isArray(candidateErrors)
        ? candidateErrors
            .map(error => {
              if (!error || typeof error !== 'object') {
                return '';
              }

              const message = (error as { message?: unknown }).message;
              return typeof message === 'string' ? message.trim() : '';
            })
            .filter(Boolean)
            .join('; ')
        : candidateErrors && typeof candidateErrors === 'object'
          ? typeof (candidateErrors as { message?: unknown }).message ===
            'string'
            ? (candidateErrors as { message?: string }).message?.trim()
            : ''
          : '';

      throw new Error(errorMessage || data.message || 'Failed to set password');
    }

    return data as SetPasswordResponse;
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
    } catch (error: unknown) {
      // If the error has response data with success: true, return it
      const axiosError = error as {
        response?: {
          data?: GetGroupJoinRequestsResponse & { success?: boolean };
        };
      };
      if (
        axiosError.response?.data &&
        'success' in axiosError.response.data &&
        axiosError.response.data.success
      ) {
        return axiosError.response.data as GetGroupJoinRequestsResponse;
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

  // Get pre-aggregated user statistics breakdown - authenticated endpoint
  async getUserStatsBreakdown(
    months = 12,
    limit = 8,
    signal?: AbortSignal
  ): Promise<UserStatsBreakdownResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      UserStatsBreakdownResponse | ApiErrorResponse
    >(`/users/stats/breakdown?months=${months}&limit=${limit}`, { signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(
        data.message || 'Failed to get user statistics breakdown'
      );
    }

    return data as UserStatsBreakdownResponse;
  }

  // Get paginated user export for a stats segment - authenticated endpoint
  async getUserStatsExport(params: {
    segment: UserStatsExportSegment;
    excludeUnsubscribed?: boolean;
    limit?: number;
    skip?: number;
    signal?: AbortSignal;
  }): Promise<UserStatsExportResponse> {
    const query = new URLSearchParams();
    query.set('segment', params.segment);
    if (params.excludeUnsubscribed === true) {
      query.set('exclude_unsubscribed', 'true');
    }
    if (typeof params.limit === 'number') {
      query.set('limit', String(params.limit));
    }
    if (typeof params.skip === 'number') {
      query.set('skip', String(params.skip));
    }

    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      UserStatsExportResponse | ApiErrorResponse
    >(
      `/users/stats/export?${query.toString()}`,
      params.signal ? { signal: params.signal } : undefined
    );
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to export users');
    }

    return data as UserStatsExportResponse;
  }

  // Get users - authenticated endpoint (supports optional email filter)
  async getUsers(email?: string): Promise<GetUsersResponse> {
    await this.ensureAuthenticated();
    const params = email ? `?email=${encodeURIComponent(email.trim())}` : '';
    const response = await this.authenticatedClient.get<
      GetUsersResponse | ApiErrorResponse
    >(`/users${params}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get users');
    }

    return data as GetUsersResponse;
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
    } catch (error: unknown) {
      // Handle 404 gracefully - the endpoint might not exist yet
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        console.warn('Pending invitations endpoint not found (404)');
        return {
          success: true,
          message: 'No invitations available',
          invitations: [],
        };
      }
      // Handle 401 gracefully - user not authenticated, return empty
      if (axiosError.response?.status === 401) {
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

  // Unassign user from group - authenticated endpoint
  async unassignUserFromGroup(
    groupId: string,
    userId: string
  ): Promise<UnassignUserFromGroupResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.delete<
      UnassignUserFromGroupResponse | ApiErrorResponse
    >(`/users/groups/${groupId}/unassign-user/${userId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to unassign user from group');
    }

    return data as UnassignUserFromGroupResponse;
  }

  // Leave group - authenticated endpoint
  async leaveGroup(groupId: string): Promise<LeaveGroupResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.delete<
      LeaveGroupResponse | ApiErrorResponse
    >(`/users/groups/${groupId}/leave`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to leave group');
    }

    return data as LeaveGroupResponse;
  }

  // Set group manager - authenticated endpoint
  async setGroupManager(
    groupId: string,
    userId: string
  ): Promise<SetGroupManagerResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      SetGroupManagerResponse | ApiErrorResponse
    >(`/users/groups/${groupId}/set-manager/${userId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to set group manager');
    }

    return data as SetGroupManagerResponse;
  }

  // Update group title - authenticated endpoint
  async updateGroupTitle(
    groupId: string,
    request: UpdateGroupTitleRequest
  ): Promise<UpdateGroupTitleResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.patch<
      UpdateGroupTitleResponse | ApiErrorResponse
    >(`/users/groups/${groupId}/title`, request);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update group title');
    }

    return data as UpdateGroupTitleResponse;
  }

  // Discover all organizations available for join requests - v2 discovery
  // endpoint. The relative path resolves against the authenticated client's
  // /api/v2 baseURL and returns every active organization for any
  // authenticated user.
  async discoverGroups(signal?: AbortSignal): Promise<DiscoverGroupsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      DiscoverGroupsResponse | ApiErrorResponse
    >('/users/groups/discover', signal ? { signal } : undefined);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to discover groups');
    }

    return data as DiscoverGroupsResponse;
  }

  // Request access to an organization the user is not a member of - v2 endpoint.
  async requestGroupAccess(
    groupId: string
  ): Promise<RequestGroupAccessResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      RequestGroupAccessResponse | ApiErrorResponse
    >(`/users/requests/groups/${encodeURIComponent(groupId)}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to request group access');
    }

    return data as RequestGroupAccessResponse;
  }

  // Normalize a paging value supplied by callers. Non-finite, fractional or
  // out-of-range inputs fall back to the endpoint default so the query
  // string always carries validated integers.
  private toPageParam(
    value: number | undefined,
    fallback: number,
    min: number
  ): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }
    const floored = Math.floor(value);
    return floored >= min ? floored : fallback;
  }

  // Get one page of organization (group) summaries - authenticated endpoint.
  // The endpoint pages with limit/skip (default limit 100) and returns no
  // total/meta, so full lists are assembled with getAllGroupsSummary.
  async getGroupsSummary(
    params?: GetGroupsSummaryParams,
    signal?: AbortSignal
  ): Promise<GetGroupsSummaryResponse> {
    const limit = this.toPageParam(params?.limit, 100, 1);
    const skip = this.toPageParam(params?.skip, 0, 0);
    const query = new URLSearchParams();
    query.set('limit', String(limit));
    query.set('skip', String(skip));

    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetGroupsSummaryResponse | ApiErrorResponse
    >(
      `/users/groups/summary?${query.toString()}`,
      signal ? { signal } : undefined
    );
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get groups summary');
    }

    return data as GetGroupsSummaryResponse;
  }

  // Get every organization (group) summary by walking the summary endpoint
  // one fixed-size page at a time (limit=100, skip=page*100). Stops on the
  // first short page, or when a full page adds zero new `_id`s — which is
  // what a backend that ignores `skip` and repeats the first page forever
  // produces, so the loop cannot run away without an arbitrary page cap that
  // would silently truncate legitimate large lists. Only previously unseen
  // groups are returned, in first-seen order; the AbortSignal is forwarded to
  // every page request so cancellation aborts in-flight work.
  async getAllGroupsSummary(signal?: AbortSignal): Promise<GroupSummary[]> {
    const pageSize = 100;
    const groups: GroupSummary[] = [];
    const seenIds = new Set<string>();

    let page = 0;
    for (;;) {
      const response = await this.getGroupsSummary(
        { limit: pageSize, skip: page * pageSize },
        signal
      );
      page += 1;
      const batch = response.groups ?? [];

      let newOnPage = 0;
      for (const group of batch) {
        if (!seenIds.has(group._id)) {
          seenIds.add(group._id);
          groups.push(group);
          newOnPage += 1;
        }
      }

      // A short page means the backend has no more groups.
      if (batch.length < pageSize) {
        break;
      }
      // A full page of already-seen ids means the backend is ignoring `skip`.
      if (newOnPage === 0) {
        break;
      }
    }

    return groups;
  }

  // Get the users assigned to a group - authenticated endpoint. Role data
  // (role_name/role_id/role_permissions) is flat on each assigned user.
  async getGroupAssignedUsers(
    groupId: string,
    signal?: AbortSignal
  ): Promise<GetGroupAssignedUsersResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetGroupAssignedUsersResponse | ApiErrorResponse
    >(
      `/users/groups/${encodeURIComponent(groupId)}/assigned-users`,
      signal ? { signal } : undefined
    );
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get group assigned users');
    }

    return data as GetGroupAssignedUsersResponse;
  }

  // Bulk-unassign users from a group - authenticated endpoint. Axios carries
  // the DELETE body through the request config's `data` field.
  async unassignManyUsersFromGroup(
    groupId: string,
    request: UnassignManyUsersFromGroupRequest
  ): Promise<UnassignManyUsersFromGroupResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.delete<
      UnassignManyUsersFromGroupResponse | ApiErrorResponse
    >(`/users/groups/${encodeURIComponent(groupId)}/unassign-many-users`, {
      data: request,
    });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to unassign users from group');
    }

    return data as UnassignManyUsersFromGroupResponse;
  }

  // Delete a group - authenticated endpoint. Deliberately no try/catch: the
  // backend currently answers 501 ("Group deletion temporarily disabled") and
  // that axios error must reach the UI so the real message can be displayed
  // instead of a rewritten one.
  async deleteGroup(groupId: string): Promise<DeleteGroupResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.delete<
      DeleteGroupResponse | ApiErrorResponse
    >(`/users/groups/${encodeURIComponent(groupId)}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to delete group');
    }

    return data as DeleteGroupResponse;
  }

  // Get one organization's activity log - authenticated endpoint. The backend
  // pages with limit/skip and IGNORES `page`, and it returns no total count,
  // so callers treat a full page as "there may be more". `activity_type` is
  // deliberately not forwarded: the endpoint enum-validates that filter and
  // rejects known-looking values, so type filtering stays client-side.
  async getGroupActivityLog(
    groupId: string,
    params?: GetGroupActivityLogParams,
    signal?: AbortSignal
  ): Promise<GetGroupActivityLogResponse> {
    const query = new URLSearchParams();
    query.set('limit', String(this.toPageParam(params?.limit, 20, 1)));
    query.set('skip', String(this.toPageParam(params?.skip, 0, 0)));

    const userId = params?.user_id?.trim();
    if (userId) query.set('user_id', userId);
    const startDate = params?.start_date?.trim();
    if (startDate) query.set('start_date', startDate);
    const endDate = params?.end_date?.trim();
    if (endDate) query.set('end_date', endDate);

    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetGroupActivityLogResponse | ApiErrorResponse
    >(
      `/users/groups/${encodeURIComponent(groupId)}/activity-log?${query.toString()}`,
      signal ? { signal } : undefined
    );
    const data = response.data;

    if ('success' in data && !data.success) {
      // The backend message is the useful one here (e.g. an unknown group or
      // an invalid date range answers 400 with the exact reason), so it is
      // surfaced verbatim.
      throw new Error(data.message || 'Failed to get group activity log');
    }

    return data as GetGroupActivityLogResponse;
  }
}

// Export singleton instance
export const userService = new UserService();
