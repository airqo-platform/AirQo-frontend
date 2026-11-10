import { headers } from 'next/headers';

import { partnersService } from '@/services/website';

import { generateMetadata } from '../page';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/services/website', () => ({
  partnersService: {
    getPartnerDetailsResult: jest.fn(),
  },
}));

jest.mock('../PartnerDetailsPage', () => ({
  __esModule: true,
  default: () => null,
}));

const mockedHeaders = headers as unknown as jest.Mock;
const mockedPartnerLookup =
  partnersService.getPartnerDetailsResult as unknown as jest.Mock;

describe('partner page metadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedHeaders.mockResolvedValue(
      new Headers({
        'x-forwarded-host': 'airqo.net',
        'x-forwarded-proto': 'https',
      }),
    );
  });

  it('uses the plain description when joined partner descriptions contain only markup', async () => {
    mockedPartnerLookup.mockResolvedValue({
      partner: {
        id: 'partner-1',
        partner_name: 'Example Partner',
        descriptions: [{ id: 1, description: '<p></p>' }],
        description: 'A clear description of this partner.',
      },
      notFound: false,
    });

    const metadata = await generateMetadata({
      params: { id: 'example-partner' },
    });

    expect(metadata.description).toBe('A clear description of this partner.');
  });

  it('keeps transient lookup failures indexable and noindexes confirmed 404s', async () => {
    mockedPartnerLookup.mockResolvedValue({ partner: null, notFound: false });
    const failedLookupMetadata = await generateMetadata({
      params: { id: 'temporarily-unavailable' },
    });
    expect(failedLookupMetadata.robots).toEqual({ index: true, follow: true });

    mockedPartnerLookup.mockResolvedValue({ partner: null, notFound: true });
    const missingPartnerMetadata = await generateMetadata({
      params: { id: 'missing-partner' },
    });
    expect(missingPartnerMetadata.robots).toEqual({
      index: false,
      follow: true,
    });
  });
});
