import { API_ROUTES, BaseApiService, ServiceOptions } from '@/services/api';

export interface CleanAirSubmission {
  id?: string | null;
  _id?: string | null;
  eventId: string;
  imageUrl: string;
  locationName: string | null;
  pm25Value: number | null;
  aqiCategory: string | null;
  displayName: string | null;
  avatarEmoji: string | null;
  createdAt: string;
}

export type CleanAirSubmissionWithId = CleanAirSubmission & {
  id: string;
};

class FacesOfCleanAirService extends BaseApiService {
  constructor() {
    super('FacesOfCleanAirService');
  }

  async getSubmissions(
    eventId: string,
    options: ServiceOptions = {},
  ): Promise<CleanAirSubmissionWithId[]> {
    const response = await this.get<{ selfies: CleanAirSubmission[] }>(
      API_ROUTES.USERS.SELFIES,
      { eventId },
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      const selfies = response.data.selfies ?? [];

      return selfies
        .map((submission) => {
          const normalizedId =
            submission.id?.trim() || submission._id?.trim() || '';

          if (!normalizedId) {
            return null;
          }

          return {
            ...submission,
            id: normalizedId,
          };
        })
        .filter(
          (submission): submission is CleanAirSubmissionWithId =>
            submission !== null,
        );
    }

    return [];
  }
}

export const facesOfCleanAirService = new FacesOfCleanAirService();
export default facesOfCleanAirService;
