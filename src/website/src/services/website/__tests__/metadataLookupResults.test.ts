import apiClient from '@/services/api/api-client';

import eventsService from '../events.service';
import partnersService from '../partners.service';

jest.mock('@/services/api/api-client', () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

const mockedApiRequest = apiClient.request as unknown as jest.Mock;

describe('metadata detail lookup results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks a partner as missing only for a confirmed 404 response', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: null,
      success: false,
      statusCode: 404,
    });

    await expect(
      partnersService.getPartnerDetailsResult('missing-partner'),
    ).resolves.toEqual({ partner: null, notFound: true });

    mockedApiRequest.mockResolvedValueOnce({
      data: null,
      success: false,
      statusCode: 503,
    });

    await expect(
      partnersService.getPartnerDetailsResult('unavailable-partner'),
    ).resolves.toEqual({ partner: null, notFound: false });
  });

  it('marks an event missing only when all supported lookups return 404', async () => {
    mockedApiRequest.mockResolvedValue({
      data: null,
      success: false,
      statusCode: 404,
    });

    await expect(
      eventsService.getEventDetailsResult('missing-event'),
    ).resolves.toEqual({ event: null, notFound: true });
    expect(mockedApiRequest).toHaveBeenCalledTimes(3);

    mockedApiRequest
      .mockResolvedValueOnce({ data: null, success: false, statusCode: 404 })
      .mockResolvedValueOnce({ data: null, success: false, statusCode: 503 })
      .mockResolvedValueOnce({ data: null, success: false, statusCode: 404 });

    await expect(
      eventsService.getEventDetailsResult('temporarily-unavailable-event'),
    ).resolves.toEqual({ event: null, notFound: false });
  });
});
