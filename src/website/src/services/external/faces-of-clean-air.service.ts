import { API_ROUTES, BaseApiService, ServiceOptions } from '@/services/api';

export interface CleanAirSubmission {
  id: string;
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
      return response.data.selfies ?? [];
    }

    return [];
  }
}

export const facesOfCleanAirService = new FacesOfCleanAirService();
export default facesOfCleanAirService;
