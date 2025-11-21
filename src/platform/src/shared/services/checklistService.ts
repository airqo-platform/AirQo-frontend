/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { getSession } from 'next-auth/react';
import type {
  GetUserChecklistResponse,
  UpdateUserChecklistRequest,
  UpdateUserChecklistResponse,
  ApiErrorResponse,
} from '../types/api';

export class ChecklistService {
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

  // Get user checklist information - authenticated endpoint
  async getUserChecklist(userId: string): Promise<GetUserChecklistResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetUserChecklistResponse | ApiErrorResponse
    >(`/users/checklist/${userId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get user checklist');
    }

    return data as GetUserChecklistResponse;
  }

  // Update user checklist information - authenticated endpoint
  async updateUserChecklist(
    checklistData: UpdateUserChecklistRequest
  ): Promise<UpdateUserChecklistResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      UpdateUserChecklistResponse | ApiErrorResponse
    >('/users/checklist/upsert', checklistData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update user checklist');
    }

    return data as UpdateUserChecklistResponse;
  }
}

// Export singleton instance
export const checklistService = new ChecklistService();
