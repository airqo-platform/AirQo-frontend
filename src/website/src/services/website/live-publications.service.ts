import type { LivePublicationsResponse } from '@/types/publications-feed';

class LivePublicationsService {
  async getLivePublications(
    params: {
      page?: number;
      page_size?: number;
    } = {},
  ): Promise<LivePublicationsResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });

    const query = searchParams.toString();
    const response = await fetch(
      `/api/publications/live${query ? `?${query}` : ''}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Live publications are temporarily unavailable');
    }

    return response.json() as Promise<LivePublicationsResponse>;
  }
}

export const livePublicationsService = new LivePublicationsService();
export default livePublicationsService;
