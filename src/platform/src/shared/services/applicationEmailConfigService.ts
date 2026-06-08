import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  ApiErrorResponse,
  CreateApplicationEmailConfigurationRequest,
  CreateApplicationEmailConfigurationResponse,
  DeleteApplicationEmailConfigurationResponse,
  GetApplicationEmailConfigurationsResponse,
  UpdateApplicationEmailConfigurationRequest,
  UpdateApplicationEmailConfigurationResponse,
} from '../types/api';

export class ApplicationEmailConfigService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  async getApplicationEmailConfigurations(): Promise<GetApplicationEmailConfigurationsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GetApplicationEmailConfigurationsResponse | ApiErrorResponse
    >('/users/application-email-configs');
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to load email configurations');
    }

    return data as GetApplicationEmailConfigurationsResponse;
  }

  async createApplicationEmailConfiguration(
    configData: CreateApplicationEmailConfigurationRequest
  ): Promise<CreateApplicationEmailConfigurationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CreateApplicationEmailConfigurationResponse | ApiErrorResponse
    >('/users/application-email-configs', configData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to create email configuration');
    }

    return data as CreateApplicationEmailConfigurationResponse;
  }

  async updateApplicationEmailConfiguration(
    configId: string,
    configData: UpdateApplicationEmailConfigurationRequest
  ): Promise<UpdateApplicationEmailConfigurationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.put<
      UpdateApplicationEmailConfigurationResponse | ApiErrorResponse
    >(`/users/application-email-configs/${configId}`, configData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to update email configuration');
    }

    return data as UpdateApplicationEmailConfigurationResponse;
  }

  async deleteApplicationEmailConfiguration(
    configId: string
  ): Promise<DeleteApplicationEmailConfigurationResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.delete<
      DeleteApplicationEmailConfigurationResponse | ApiErrorResponse
    >(`/users/application-email-configs/${configId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to delete email configuration');
    }

    return data as DeleteApplicationEmailConfigurationResponse;
  }
}

export const applicationEmailConfigService =
  new ApplicationEmailConfigService();
