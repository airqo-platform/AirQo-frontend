/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
  createOpenClient,
} from './apiClient';
import { getSession } from 'next-auth/react';
import type {
  GetClientsResponse,
  CreateClientRequest,
  CreateClientResponse,
  UpdateClientRequest,
  UpdateClientResponse,
  ActivateClientRequest,
  ActivateClientResponse,
  RequestClientActivationResponse,
  GenerateTokenRequest,
  GenerateTokenResponse,
  DeleteClientResponse,
  RefreshClientSecretResponse,
  GetClientByIdResponse,
  ApiErrorResponse,
} from '../types/api';

export class ClientService {
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

  // Get all clients for the authenticated user
  async getClients(): Promise<GetClientsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetClientsResponse | ApiErrorResponse
    >('/users/clients');
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get clients');
    }

    return data as GetClientsResponse;
  }

  // Get clients for a specific user
  async getClientsByUserId(userId: string): Promise<GetClientsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetClientsResponse | ApiErrorResponse
    >(`/users/clients?user_id=${userId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get clients for user');
    }

    return data as GetClientsResponse;
  }

  // Create a new client
  async createClient(
    clientData: CreateClientRequest
  ): Promise<CreateClientResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CreateClientResponse | ApiErrorResponse
    >('/users/clients', clientData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to create client');
    }

    return data as CreateClientResponse;
  }

  // Update an existing client
  async updateClient(
    clientId: string,
    clientData: UpdateClientRequest
  ): Promise<UpdateClientResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdateClientResponse | ApiErrorResponse
    >(`/users/clients/${clientId}`, clientData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update client');
    }

    return data as UpdateClientResponse;
  }

  // Activate or deactivate a client
  async activateClient(
    clientId: string,
    activationData: ActivateClientRequest
  ): Promise<ActivateClientResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      ActivateClientResponse | ApiErrorResponse
    >(`/users/clients/activate/${clientId}`, activationData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to activate client');
    }

    return data as ActivateClientResponse;
  }

  // Request client activation
  async requestClientActivation(
    clientId: string
  ): Promise<RequestClientActivationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      RequestClientActivationResponse | ApiErrorResponse
    >(`/users/clients/activate-request/${clientId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to request client activation');
    }

    return data as RequestClientActivationResponse;
  }

  // Generate token for a client
  async generateToken(
    tokenData: GenerateTokenRequest
  ): Promise<GenerateTokenResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      GenerateTokenResponse | ApiErrorResponse
    >('/users/tokens', tokenData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to generate token');
    }

    return data as GenerateTokenResponse;
  }

  // Get client by ID
  async getClientById(clientId: string): Promise<GetClientByIdResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetClientByIdResponse | ApiErrorResponse
    >(`/users/clients/${clientId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get client details');
    }

    return data as GetClientByIdResponse;
  }

  // Delete a client
  async deleteClient(clientId: string): Promise<DeleteClientResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.delete<
      DeleteClientResponse | ApiErrorResponse
    >(`/users/clients/${clientId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to delete client');
    }

    return data as DeleteClientResponse;
  }

  // Refresh client secret
  async refreshClientSecret(
    clientId: string
  ): Promise<RefreshClientSecretResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.patch<
      RefreshClientSecretResponse | ApiErrorResponse
    >(`/users/clients/${clientId}/secret`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to refresh client secret');
    }

    return data as RefreshClientSecretResponse;
  }
}

// Export singleton instance
export const clientService = new ClientService();
