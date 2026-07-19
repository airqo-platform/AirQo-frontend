/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  GetOrganizationRequestsResponse,
  ApproveOrganizationRequestResponse,
  RejectOrganizationRequestResponse,
  GetRolesResponse,
  GetPermissionsResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRolePermissionsRequest,
  UpdateRolePermissionsResponse,
  UpdateRoleDataRequest,
  UpdateRoleDataResponse,
  GetRoleByIdResponse,
  GetUsersByRoleResponse,
  AssignUsersToRoleRequest,
  AssignUsersToRoleResponse,
  UnassignUsersFromRoleRequest,
  UnassignUsersFromRoleResponse,
  GetBlockedAsnsResponse,
  CreateBlockedAsnRequest,
  CreateBlockedAsnResponse,
  DeleteBlockedAsnResponse,
  GetFlaggedTokensResponse,
  ResolveFlaggedTokenRequest,
  ResolveFlaggedTokenResponse,
  GetBypassedTokensResponse,
  UpdateTokenBypassRequest,
  UpdateTokenBypassResponse,
} from '../types/api';

const extractSuccessData = <T extends { success?: boolean; message?: string }>(
  data: T,
  fallbackMessage: string
): T => {
  if (data?.success === false) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

export class AdminService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  // Get all organization requests - authenticated admin endpoint
  async getOrganizationRequests(): Promise<GetOrganizationRequestsResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.get<GetOrganizationRequestsResponse>(
        '/users/org-requests'
      );
    return extractSuccessData(response.data, 'Failed to get organization requests');
  }

  // Approve organization request - authenticated admin endpoint
  async approveOrganizationRequest(
    requestId: string
  ): Promise<ApproveOrganizationRequestResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.patch<ApproveOrganizationRequestResponse>(
        `/users/org-requests/${requestId}/approve`
      );
    return extractSuccessData(response.data, 'Failed to approve organization request');
  }

  // Reject organization request - authenticated admin endpoint
  async rejectOrganizationRequest(
    requestId: string,
    rejection_reason: string = ''
  ): Promise<RejectOrganizationRequestResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.patch<RejectOrganizationRequestResponse>(
        `/users/org-requests/${requestId}/reject`,
        { rejection_reason }
      );
    return extractSuccessData(response.data, 'Failed to reject organization request');
  }

  // Get roles by group_id - authenticated admin endpoint
  async getRolesByGroup(groupId?: string): Promise<GetRolesResponse> {
    await this.ensureAuthenticated();
    const url = groupId ? `/users/roles?group_id=${groupId}` : '/users/roles';
    const response = await this.authenticatedClient.get<GetRolesResponse>(url);
    return extractSuccessData(response.data, 'Failed to get roles');
  }

  // Get role by ID - authenticated admin endpoint
  async getRoleById(roleId: string): Promise<GetRoleByIdResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<GetRoleByIdResponse>(
      `/users/roles/${roleId}`
    );

    return extractSuccessData(response.data, 'Failed to get role');
  }

  // Get all permissions - authenticated admin endpoint
  async getPermissions(): Promise<GetPermissionsResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.get<GetPermissionsResponse>(
        '/users/permissions'
      );
    return extractSuccessData(response.data, 'Failed to get permissions');
  }

  // Create a new role - authenticated admin endpoint
  async createRole(roleData: CreateRoleRequest): Promise<CreateRoleResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<CreateRoleResponse>(
      '/users/roles',
      roleData
    );
    return extractSuccessData(response.data, 'Failed to create role');
  }

  // Update role permissions - authenticated admin endpoint
  async updateRolePermissions(
    roleId: string,
    permissionData: UpdateRolePermissionsRequest
  ): Promise<UpdateRolePermissionsResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.put<UpdateRolePermissionsResponse>(
        `/users/roles/${roleId}/permissions`,
        permissionData
      );
    return extractSuccessData(response.data, 'Failed to update role permissions');
  }

  // Update role data (name and status) - authenticated admin endpoint
  async updateRoleData(
    roleId: string,
    roleData: UpdateRoleDataRequest
  ): Promise<UpdateRoleDataResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<UpdateRoleDataResponse>(
      `/users/roles/${roleId}`,
      roleData
    );
    return extractSuccessData(response.data, 'Failed to update role data');
  }

  // Get users by role - authenticated admin endpoint
  async getUsersByRole(roleId: string): Promise<GetUsersByRoleResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<GetUsersByRoleResponse>(
      `/users/roles/${roleId}/users`
    );
    return extractSuccessData(response.data, 'Failed to get users by role');
  }

  // Assign users to role - authenticated admin endpoint
  async assignUsersToRole(
    roleId: string,
    userData: AssignUsersToRoleRequest
  ): Promise<AssignUsersToRoleResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.post<AssignUsersToRoleResponse>(
        `/users/roles/${roleId}/users`,
        userData
      );
    return extractSuccessData(response.data, 'Failed to assign users to role');
  }

  // Unassign users from role - authenticated admin endpoint
  async unassignUsersFromRole(
    roleId: string,
    userData: UnassignUsersFromRoleRequest
  ): Promise<UnassignUsersFromRoleResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.delete<UnassignUsersFromRoleResponse>(
        `/users/roles/${roleId}/users`,
        { data: userData }
      );
    return extractSuccessData(response.data, 'Failed to unassign users from role');
  }

  // Get blocked ASN/CIDR entries
  async getBlockedASNs(params?: {
    active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<GetBlockedAsnsResponse> {
    await this.ensureAuthenticated();
    const query = new URLSearchParams();
    if (typeof params?.active === 'boolean') {
      query.set('active', String(params.active));
    }
    if (typeof params?.skip === 'number') {
      query.set('skip', String(params.skip));
    }
    if (typeof params?.limit === 'number') {
      query.set('limit', String(params.limit));
    }

    const url = query.toString()
      ? `/users/tokens/blocked-asns?${query.toString()}`
      : '/users/tokens/blocked-asns';

    const response =
      await this.authenticatedClient.get<GetBlockedAsnsResponse>(url);
    return extractSuccessData(
      response.data,
      'Failed to get blocked ASN entries'
    );
  }

  async createBlockedASN(
    payload: CreateBlockedAsnRequest
  ): Promise<CreateBlockedAsnResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.post<CreateBlockedAsnResponse>(
        '/users/tokens/blocked-asns',
        payload
      );
    return extractSuccessData(
      response.data,
      'Failed to create blocked ASN entry'
    );
  }

  async deleteBlockedASN(id: string): Promise<DeleteBlockedAsnResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.delete<DeleteBlockedAsnResponse>(
        `/users/tokens/blocked-asns/${encodeURIComponent(id)}`
      );
    return extractSuccessData(
      response.data,
      'Failed to delete blocked ASN entry'
    );
  }

  async getFlaggedTokens(params?: {
    resolved?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<GetFlaggedTokensResponse> {
    await this.ensureAuthenticated();
    const query = new URLSearchParams();
    if (typeof params?.resolved === 'boolean') {
      query.set('resolved', String(params.resolved));
    }
    if (typeof params?.skip === 'number') {
      query.set('skip', String(params.skip));
    }
    if (typeof params?.limit === 'number') {
      query.set('limit', String(params.limit));
    }

    const url = query.toString()
      ? `/users/tokens/flagged-tokens?${query.toString()}`
      : '/users/tokens/flagged-tokens';

    const response =
      await this.authenticatedClient.get<GetFlaggedTokensResponse>(url);
    return extractSuccessData(response.data, 'Failed to get flagged tokens');
  }

  async resolveFlaggedToken(
    id: string,
    payload: ResolveFlaggedTokenRequest = {}
  ): Promise<ResolveFlaggedTokenResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.put<ResolveFlaggedTokenResponse>(
        `/users/tokens/flagged-tokens/${encodeURIComponent(id)}/resolve`,
        payload
      );
    return extractSuccessData(response.data, 'Failed to resolve flagged token');
  }

  async getBypassedTokens(
    signal?: AbortSignal
  ): Promise<GetBypassedTokensResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.get<GetBypassedTokensResponse>(
        '/users/tokens/bypasses',
        { signal }
      );
    return extractSuccessData(
      response.data,
      'Failed to get bypassed tokens'
    );
  }

  async updateTokenBypass(
    token: string,
    payload: UpdateTokenBypassRequest
  ): Promise<UpdateTokenBypassResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.patch<UpdateTokenBypassResponse>(
        `/users/tokens/${encodeURIComponent(token)}`,
        payload
      );
    return extractSuccessData(
      response.data,
      'Failed to update token bypass'
    );
  }
}

export const adminService = new AdminService();
