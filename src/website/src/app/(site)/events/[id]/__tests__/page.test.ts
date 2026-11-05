import { headers } from 'next/headers';

import { eventsService } from '@/services/website';

import { generateMetadata } from '../page';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/services/website', () => ({
  eventsService: {
    getEventDetailsResult: jest.fn(),
  },
}));

jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/features/events/SingleEvent', () => ({
  __esModule: true,
  default: () => null,
}));

const mockedHeaders = headers as unknown as jest.Mock;
const mockedEventLookup =
  eventsService.getEventDetailsResult as unknown as jest.Mock;

describe('event page metadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedHeaders.mockResolvedValue(
      new Headers({
        'x-forwarded-host': 'airqo.net',
        'x-forwarded-proto': 'https',
      }),
    );
  });

  it('uses fallback copy instead of raw event details and tries the next valid image', async () => {
    mockedEventLookup.mockResolvedValue({
      event: {
        id: 'event-1',
        title: 'Example Event',
        description: '<p></p>',
        event_details: '{"ops":[{"insert":"Raw editor data"}]}',
        event_image_url: 'javascript:invalid',
        background_image_url: '/images/event.jpg',
      },
      notFound: false,
    });

    const metadata = await generateMetadata({
      params: { id: 'example-event' },
    });
    const images = metadata.openGraph?.images;

    expect(metadata.description).toBe(
      'Find details about this AirQo event and its air quality community programme.',
    );
    expect(metadata.description).not.toContain('Raw editor data');
    if (!Array.isArray(images)) {
      throw new Error('Expected Open Graph images to be an array');
    }
    expect(images[0]).toHaveProperty(
      'url',
      'https://airqo.net/images/event.jpg',
    );
  });

  it('keeps transient lookup failures indexable and noindexes confirmed 404s', async () => {
    mockedEventLookup.mockResolvedValue({ event: null, notFound: false });
    const failedLookupMetadata = await generateMetadata({
      params: { id: 'temporarily-unavailable' },
    });
    expect(failedLookupMetadata.robots).toEqual({ index: true, follow: true });

    mockedEventLookup.mockResolvedValue({ event: null, notFound: true });
    const missingEventMetadata = await generateMetadata({
      params: { id: 'missing-event' },
    });
    expect(missingEventMetadata.robots).toEqual({ index: false, follow: true });
  });
});
