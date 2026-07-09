import { API_ROUTES, BaseApiService, ServiceOptions } from '@/services/api';
import apiClient from '@/services/api/api-client';

export interface CleanAirSubmission {
  id: string;
  _id: string;
  eventId: string;
  imageUrl: string;
  locationName: string | null;
  pm25Value: number | null;
  aqiCategory: string | null;
  displayName: string | null;
  avatarEmoji: string | null;
  createdAt: string;
}

class FacesOfCleanAirService extends BaseApiService {
  constructor() {
    super('FacesOfCleanAirService');
  }

  async getSubmissions(
    eventId: string,
    options: ServiceOptions = {},
  ): Promise<CleanAirSubmission[]> {
    const response = await this.get<{ selfies: CleanAirSubmission[] }>(
      API_ROUTES.USERS.SELFIES,
      { eventId },
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      const selfies = response.data.selfies ?? [];
      return selfies.map((s) => ({ ...s, id: s.id || s._id }));
    }

    return [];
  }

  async deleteSubmission(id: string): Promise<boolean> {
    try {
      const response = await apiClient.request<unknown>({
        method: 'DELETE',
        url: API_ROUTES.USERS.SELFIE_BY_ID(id),
      });

      return response.success;
    } catch {
      return false;
    }
  }

  async hideSubmission(id: string): Promise<boolean> {
    try {
      const response = await apiClient.request<unknown>({
        method: 'PATCH',
        url: API_ROUTES.USERS.SELFIE_BY_ID(id),
      });

      return response.success;
    } catch {
      return false;
    }
  }
}

export const facesOfCleanAirService = new FacesOfCleanAirService();
export default facesOfCleanAirService;
