import { ApiClient, createOpenClient } from './apiClient';
import type { MaintenanceResponse } from '../types/api';

export class MaintenanceService {
  private openClient: ApiClient;

  constructor() {
    this.openClient = createOpenClient();
  }

  async getMaintenance(product = 'analytics'): Promise<MaintenanceResponse> {
    const normalizedProduct = product.trim().toLowerCase() || 'analytics';
    const response = await this.openClient.get<MaintenanceResponse>(
      `/users/maintenances/${normalizedProduct}`
    );
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Failed to load maintenance status');
    }

    return data;
  }
}

export const maintenanceService = new MaintenanceService();
