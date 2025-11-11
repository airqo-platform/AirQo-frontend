/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { getSession } from 'next-auth/react';
import type {
  GetOrganizationRequestsResponse,
  ApproveOrganizationRequestResponse,
  RejectOrganizationRequestResponse,
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
}

export const adminService = new AdminService();
