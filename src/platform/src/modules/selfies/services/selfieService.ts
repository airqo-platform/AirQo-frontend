import {
  ApiClient,
  createAuthenticatedClient,
} from '@/shared/services/apiClient';
import { syncClientSessionToken } from '@/shared/services/sessionAuthToken';
import type {
  GetSelfiesResponse,
  SelfieActionResponse,
} from '@/shared/types/api';

const extractResponseData = <T extends { success?: boolean; message?: string }>(
  data: T,
  fallbackMessage: string
): T => {
  if ('success' in data && data.success === false) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

export class SelfieService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  async getSelfies(
    eventId: string,
    includeHidden = true
  ): Promise<GetSelfiesResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<GetSelfiesResponse>(
      '/users/selfies',
      { params: { eventId, includeHidden } }
    );

    return extractResponseData(
      response.data,
      'Failed to load selfies'
    );
  }

  async hideSelfie(id: string): Promise<SelfieActionResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<SelfieActionResponse>(
      `/users/selfies/${id}`,
      { hidden: true }
    );

    return extractResponseData(
      response.data,
      'Failed to hide selfie'
    );
  }

  async unhideSelfie(id: string): Promise<SelfieActionResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<SelfieActionResponse>(
      `/users/selfies/${id}`,
      { hidden: false }
    );

    return extractResponseData(
      response.data,
      'Failed to unhide selfie'
    );
  }

  async deleteSelfie(id: string): Promise<SelfieActionResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<SelfieActionResponse>(
      `/users/selfies/${id}`
    );

    return extractResponseData(
      response.data,
      'Failed to delete selfie'
    );
  }
}

export const selfieService = new SelfieService();
