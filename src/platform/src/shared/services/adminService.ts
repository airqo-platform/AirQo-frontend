/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { getSession } from 'next-auth/react';
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
} from '../types/api';

export class AdminService {
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

  // Get all organization requests - authenticated admin endpoint
  async getOrganizationRequests(): Promise<GetOrganizationRequestsResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.get<GetOrganizationRequestsResponse>(
        '/users/org-requests'
      );
    return response.data;
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
    return response.data;
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
    return response.data;
  }

  // Get roles by group_id - authenticated admin endpoint
  async getRolesByGroup(groupId?: string): Promise<GetRolesResponse> {
    await this.ensureAuthenticated();
    const url = groupId ? `/users/roles?group_id=${groupId}` : '/users/roles';
    const response = await this.authenticatedClient.get<GetRolesResponse>(url);
    return response.data;
  }

  // Get role by ID - authenticated admin endpoint
  async getRoleById(roleId: string): Promise<GetRoleByIdResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<GetRoleByIdResponse>(
      `/users/roles/${roleId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch role');
    }

    return response.data;
  }

  // Get all permissions - authenticated admin endpoint
  async getPermissions(): Promise<GetPermissionsResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.get<GetPermissionsResponse>(
        '/users/permissions'
      );
    return response.data;
  }

  // Create a new role - authenticated admin endpoint
  async createRole(roleData: CreateRoleRequest): Promise<CreateRoleResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<CreateRoleResponse>(
      '/users/roles',
      roleData
    );
    return response.data;
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
    return response.data;
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
    return response.data;
  }

  // Get users by role - authenticated admin endpoint
  async getUsersByRole(roleId: string): Promise<GetUsersByRoleResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<GetUsersByRoleResponse>(
      `/users/roles/${roleId}/users`
    );
    return response.data;
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
    return response.data;
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
    return response.data;
  }
}

export const adminService = new AdminService();
