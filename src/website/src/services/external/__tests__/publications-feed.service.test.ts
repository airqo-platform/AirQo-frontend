/** @jest-environment node */

import {
  applyLivePublicationOverrides,
  formatCrossrefDateParts,
  getCanonicalPublicationUrl,
  getLivePublications,
  hasAirQoAffiliation,
  isAirQualityTopic,
  mergePublicationResults,
  normalizePublicationText,
} from '@/services/external/publications-feed.service';
import type {
  LivePublication,
  LivePublicationFeedSettings,
} from '@/types/publications-feed';

const createPublication = (
  overrides: Partial<LivePublication> = {},
): LivePublication => ({
  id: 'openalex:1',
  title: 'Air quality in Kampala',
  authors: ['Engineer Bainomugisha'],
  url: 'https://doi.org/10.1234/example',
  source: 'openalex',
  sourceLabel: 'OpenAlex',
  sourceRecordUrl: 'https://openalex.org/W1',
  ...overrides,
});

const createFeedSettings = (
  overrides: Partial<LivePublicationFeedSettings> = {},
): LivePublicationFeedSettings => ({
  enabled: true,
  openalex_author_ids: ['A5047583981', 'A5051886991'],
  allowed_affiliations: ['AirQo'],
  relevance_keywords: ['air quality', 'pollution'],
  relevance_required: true,
  openalex_api_url: 'https://api.openalex.org/works',
  crossref_api_url: 'https://api.crossref.org/works',
  crossref_mailto: 'info@airqo.net',
  updated_at: '2026-10-27T00:00:00Z',
  ...overrides,
});

describe('mergePublicationResults', () => {
  it('deduplicates OpenAlex and Crossref records by DOI', () => {
    const results = mergePublicationResults([
      {
        provider: 'openalex',
        results: [
          createPublication({
            doi: '10.1234/EXAMPLE',
            publishedDate: '2024-01-01',
          }),
        ],
      },
      {
        provider: 'crossref',
        results: [
          createPublication({
            id: 'crossref:10.1234/example',
            source: 'crossref',
            sourceLabel: 'Crossref',
            sourceRecordUrl: 'https://doi.org/10.1234/example',
            authors: [],
            abstract: 'Metadata backfill',
            doi: '10.1234/example',
          }),
        ],
      },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].source).toBe('openalex');
    expect(results[0].abstract).toBe('Metadata backfill');
  });

  it('deduplicates records without a DOI by normalized title and sorts newest first', () => {
    const results = mergePublicationResults([
      {
        provider: 'openalex',
        results: [
          createPublication({
            id: 'openalex:older',
            title: 'Older Air Quality Study',
            doi: undefined,
            year: 2022,
          }),
          createPublication({
            id: 'openalex:newer',
            title: 'Newer Air Quality Study',
            doi: undefined,
            year: 2025,
          }),
        ],
      },
      {
        provider: 'crossref',
        results: [
          createPublication({
            id: 'crossref:older',
            title: 'Older: Air Quality Study',
            doi: undefined,
            source: 'crossref',
            sourceLabel: 'Crossref',
            year: 2022,
          }),
        ],
      },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Newer Air Quality Study');
    expect(results[1].title).toBe('Older Air Quality Study');
  });

  it('applies staff overrides by DOI and OpenAlex ID without changing provider attribution', () => {
    const publications = [
      createPublication({
        id: 'https://openalex.org/W123456789',
        doi: 'https://doi.org/10.1234/EXAMPLE',
        journal: 'Provider Journal',
      }),
      createPublication({
        id: 'https://openalex.org/W987654321',
        doi: undefined,
        journal: undefined,
      }),
    ];

    const updated = applyLivePublicationOverrides(publications, [
      {
        external_identifier: 'doi:10.1234/example',
        authors: ['  Corrected Author  ', 'Second Author'],
        journal: 'Editorial Source',
      },
      {
        external_identifier: 'openalex:W987654321',
        authors: ['OpenAlex Author'],
      },
    ]);

    expect(updated[0]).toMatchObject({
      authors: ['Corrected Author', 'Second Author'],
      journal: 'Editorial Source',
      source: 'openalex',
      sourceLabel: 'OpenAlex',
    });
    expect(updated[1]).toMatchObject({
      authors: ['OpenAlex Author'],
      source: 'openalex',
      sourceLabel: 'OpenAlex',
    });
    expect(publications[0].authors).toEqual(['Engineer Bainomugisha']);
  });
});

describe('getLivePublications', () => {
  it('does not call providers when the backend disables the feed', async () => {
    const originalApiUrl = process.env.API_URL;
    const originalFetch = globalThis.fetch;
    process.env.API_URL = 'https://platform.example';
    const fetchMock = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toContain(
          '/website/api/v2/live-publication-feed-settings/',
        );
        expect(init).toMatchObject({ cache: 'no-store' });
        return {
          ok: true,
          json: async () => createFeedSettings({ enabled: false }),
        } as Response;
      },
    );
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const response = await getLivePublications({ page: 2, pageSize: 4 });

      expect(response).toMatchObject({
        enabled: false,
        results: [],
        count: 0,
        pageSize: 4,
        totalPages: 0,
        currentPage: 2,
        providers: [],
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
    } finally {
      if (originalApiUrl === undefined) delete process.env.API_URL;
      else process.env.API_URL = originalApiUrl;

      if (originalFetch) globalThis.fetch = originalFetch;
      else delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });

  it('returns a degraded empty live feed when every provider is unavailable', async () => {
    const originalApiUrl = process.env.API_URL;
    const originalOpenAlexKey = process.env.OPENALEX_API_KEY;
    const originalFetch = globalThis.fetch;
    process.env.API_URL = 'https://platform.example';
    delete process.env.OPENALEX_API_KEY;
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (url.pathname === '/website/api/v2/live-publication-feed-settings/') {
        return {
          ok: true,
          json: async () => createFeedSettings(),
        } as Response;
      }

      if (url.hostname === 'api.crossref.org') {
        throw new Error('Crossref unavailable');
      }

      throw new Error(`Unexpected request: ${url.toString()}`);
    }) as typeof fetch;

    try {
      const response = await getLivePublications({ page: 2, pageSize: 4 });

      expect(response).toMatchObject({
        enabled: true,
        results: [],
        count: 0,
        pageSize: 4,
        totalPages: 0,
        currentPage: 2,
        providers: [],
        degraded: true,
      });
    } finally {
      if (originalApiUrl === undefined) delete process.env.API_URL;
      else process.env.API_URL = originalApiUrl;
      if (originalOpenAlexKey === undefined)
        delete process.env.OPENALEX_API_KEY;
      else process.env.OPENALEX_API_KEY = originalOpenAlexKey;
      if (originalFetch) globalThis.fetch = originalFetch;
      else delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });

  it('uses backend filters and the server-only OpenAlex key, then applies overrides', async () => {
    const envNames = ['OPENALEX_API_KEY', 'API_URL'] as const;
    const originalValues = Object.fromEntries(
      envNames.map((name) => [name, process.env[name]]),
    );
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn(
      async (
        input: RequestInfo | URL,
        _init?: RequestInit & { next?: { revalidate?: number } },
      ) => {
        const url = new URL(String(input));

        if (
          url.pathname === '/website/api/v2/live-publication-feed-settings/'
        ) {
          expect(_init).toMatchObject({ cache: 'no-store' });
          expect(url.searchParams.has('token')).toBe(false);
          return {
            ok: true,
            json: async () =>
              createFeedSettings({
                openalex_author_ids: [
                  'A5047583981',
                  'A5047583981',
                  'invalid',
                  'a5051886991',
                ],
              }),
          } as Response;
        }

        if (url.hostname === 'api.openalex.org') {
          const headers = _init?.headers as Record<string, string>;
          expect(headers.Authorization).toBe('Bearer test-openalex-key');
          return {
            ok: true,
            json: async () => ({
              results: [
                {
                  id: 'https://openalex.org/W123456789',
                  title: 'Air quality in Kampala',
                  doi: 'https://doi.org/10.1234/example',
                  publication_year: 2025,
                  publication_date: '2025-01-01',
                  authorships: [
                    {
                      author: { display_name: 'Provider Author' },
                      raw_affiliation_strings: ['AirQo'],
                    },
                  ],
                  primary_location: {
                    source: { display_name: 'Provider Journal' },
                  },
                },
                {
                  id: 'https://openalex.org/W987654321',
                  title: 'A study of Ugandan banknotes',
                  publication_year: 2024,
                  authorships: [
                    {
                      author: { display_name: 'Provider Author' },
                      raw_affiliation_strings: ['Makerere University'],
                    },
                  ],
                },
              ],
            }),
          } as Response;
        }

        if (url.hostname === 'api.crossref.org') {
          return {
            ok: true,
            json: async () => ({ message: { items: [] } }),
          } as Response;
        }

        if (url.pathname === '/website/api/v2/live-publication-overrides/') {
          expect(_init).toMatchObject({ cache: 'no-store' });
          expect(url.searchParams.getAll('identifier')).toEqual(
            expect.arrayContaining([
              'doi:10.1234/example',
              'openalex:W123456789',
            ]),
          );
          expect(url.searchParams.has('token')).toBe(false);
          return {
            ok: true,
            json: async () => [
              {
                external_identifier: 'doi:10.1234/example',
                authors: ['Corrected Author'],
                journal: 'Editorial Source',
              },
            ],
          } as Response;
        }

        throw new Error(`Unexpected request: ${url.toString()}`);
      },
    );

    Object.assign(process.env, {
      OPENALEX_API_KEY: 'test-openalex-key',
      API_URL: 'https://platform.example',
    });
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const response = await getLivePublications();
      const overrideRequest = fetchMock.mock.calls.find(([input]) =>
        String(input).includes('/website/api/v2/live-publication-overrides/'),
      );
      const settingsRequest = fetchMock.mock.calls.find(([input]) =>
        String(input).includes(
          '/website/api/v2/live-publication-feed-settings/',
        ),
      );
      const openAlexRequest = fetchMock.mock.calls.find(([input]) =>
        String(input).includes('api.openalex.org'),
      );
      const crossrefRequest = fetchMock.mock.calls.find(([input]) =>
        String(input).includes('api.crossref.org'),
      );
      const openAlexUrl = new URL(String(openAlexRequest?.[0]));
      const crossrefUrl = new URL(String(crossrefRequest?.[0]));

      expect(response.results[0]).toMatchObject({
        authors: ['Corrected Author'],
        journal: 'Editorial Source',
      });
      expect(response.results[0].sourceLabel).toBe('OpenAlex');
      expect(response.enabled).toBe(true);
      expect(response.providers).toEqual(['openalex', 'crossref']);
      expect(response.count).toBe(1);
      expect(openAlexUrl.searchParams.get('api_key')).toBeNull();
      expect(openAlexUrl.searchParams.get('filter')).toBe(
        'authorships.author.id:A5047583981|A5051886991',
      );
      expect(crossrefUrl.searchParams.get('query.affiliation')).toBe('AirQo');
      expect(settingsRequest?.[1]).toMatchObject({ cache: 'no-store' });
      expect(settingsRequest?.[0].toString()).not.toContain('token');
      expect(
        (openAlexRequest?.[1] as RequestInit | undefined)?.headers,
      ).toMatchObject({ 'X-AirQo-Policy-Version': '2026-10-27T00:00:00Z' });
      expect(crossrefUrl.searchParams.get('mailto')).toBe('info@airqo.net');
      expect(overrideRequest?.[1]).toMatchObject({ cache: 'no-store' });
    } finally {
      envNames.forEach((name) => {
        const originalValue = originalValues[name];
        if (originalValue === undefined) delete process.env[name];
        else process.env[name] = originalValue;
      });
      if (originalFetch) globalThis.fetch = originalFetch;
      else delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });

  it('applies admin-configured affiliations to Crossref without hard-coded AirQo filtering', async () => {
    const originalApiUrl = process.env.API_URL;
    const originalOpenAlexKey = process.env.OPENALEX_API_KEY;
    const originalFetch = globalThis.fetch;
    process.env.API_URL = 'https://platform.example';
    process.env.OPENALEX_API_KEY = 'test-openalex-key';

    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (url.pathname === '/website/api/v2/live-publication-feed-settings/') {
        return {
          ok: true,
          json: async () =>
            createFeedSettings({
              openalex_author_ids: [],
              allowed_affiliations: ['Makerere University'],
              relevance_keywords: ['wildlife'],
              relevance_required: true,
            }),
        } as Response;
      }

      if (url.hostname === 'api.openalex.org') {
        throw new Error('OpenAlex unavailable');
      }

      if (url.hostname === 'api.crossref.org') {
        expect(url.searchParams.get('query.affiliation')).toBe(
          'Makerere University',
        );
        return {
          ok: true,
          json: async () => ({
            message: {
              items: [
                {
                  DOI: '10.5555/makerere-study',
                  title: ['A study from Makerere University'],
                  author: [
                    {
                      name: 'Crossref Author',
                      affiliation: [{ name: 'Makerere University' }],
                    },
                  ],
                  published: { 'date-parts': [[2025, 1, 1]] },
                },
              ],
            },
          }),
        } as Response;
      }

      if (url.pathname === '/website/api/v2/live-publication-overrides/') {
        return { ok: true, json: async () => [] } as Response;
      }

      throw new Error(`Unexpected request: ${url.toString()}`);
    });
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const response = await getLivePublications();

      expect(response.providers).toEqual(['crossref']);
      expect(response.results).toHaveLength(1);
      expect(response.results[0]).toMatchObject({
        source: 'crossref',
        title: 'A study from Makerere University',
      });
    } finally {
      if (originalApiUrl === undefined) delete process.env.API_URL;
      else process.env.API_URL = originalApiUrl;
      if (originalOpenAlexKey === undefined)
        delete process.env.OPENALEX_API_KEY;
      else process.env.OPENALEX_API_KEY = originalOpenAlexKey;
      if (originalFetch) globalThis.fetch = originalFetch;
      else delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });
});

describe('normalizePublicationText', () => {
  it('strips Crossref JATS markup and collapses newlines to single spaces', () => {
    const crossrefTitle =
      'Transferability of Machine Learning‐Based Calibration Models for Low‐Cost\n <scp>PM</scp>\n <sub>2.5</sub>\n Sensors Across Heterogeneous African Cities';

    expect(normalizePublicationText(crossrefTitle)).toBe(
      'Transferability of Machine Learning‐Based Calibration Models for Low‐Cost PM 2.5 Sensors Across Heterogeneous African Cities',
    );
  });

  it('decodes common HTML entities', () => {
    expect(
      normalizePublicationText(
        'Air &amp; Dust &lt;Guide&gt; &quot;Edition&nbsp;One&quot; &#39;beta&#39; &apos;final&apos;',
      ),
    ).toBe("Air & Dust <Guide> \"Edition One\" 'beta' 'final'");
  });

  it('returns undefined for empty and whitespace-only input', () => {
    expect(normalizePublicationText(undefined)).toBeUndefined();
    expect(normalizePublicationText(null)).toBeUndefined();
    expect(normalizePublicationText('')).toBeUndefined();
    expect(normalizePublicationText('   \n\t  ')).toBeUndefined();
    expect(normalizePublicationText('<span></span>')).toBeUndefined();
  });

  it('leaves plain text unchanged apart from trimming', () => {
    expect(normalizePublicationText('  Air Quality in Kampala  ')).toBe(
      'Air Quality in Kampala',
    );
    expect(normalizePublicationText('PM2.5 & PM10')).toBe('PM2.5 & PM10');
  });
});

describe('getCanonicalPublicationUrl', () => {
  it('prefers the DOI resolver over a provider landing page', () => {
    expect(
      getCanonicalPublicationUrl({
        doi: 'https://doi.org/10.1234/Exact-Work',
        landingPageUrl: 'https://publisher.example/possibly-stale-page',
        openAlexId: 'W123',
      }),
    ).toBe('https://doi.org/10.1234/exact-work');
  });

  it('falls back to the provider landing page when a DOI is unavailable', () => {
    expect(
      getCanonicalPublicationUrl({
        landingPageUrl: 'https://publisher.example/exact-work',
        openAlexId: 'W123',
      }),
    ).toBe('https://publisher.example/exact-work');
  });

  it('falls back to the OpenAlex record when no publication landing page exists', () => {
    expect(
      getCanonicalPublicationUrl({
        openAlexId: 'https://openalex.org/W123',
      }),
    ).toBe('https://openalex.org/W123');
  });
});

describe('formatCrossrefDateParts', () => {
  it('pads month and day parts for stable ISO date sorting', () => {
    expect(formatCrossrefDateParts([2024, 3, 5])).toBe('2024-03-05');
  });

  it('preserves year-only and year-month Crossref dates', () => {
    expect(formatCrossrefDateParts([2024])).toBe('2024');
    expect(formatCrossrefDateParts([2024, 3])).toBe('2024-03');
    expect(formatCrossrefDateParts(undefined)).toBeUndefined();
  });
});

describe('AirQo relevance checks', () => {
  it('recognizes AirQo affiliations without treating Makerere alone as AirQo', () => {
    expect(
      hasAirQoAffiliation([
        'AirQo, Department of Computer Science, Makerere University',
      ]),
    ).toBe(true);
    expect(hasAirQoAffiliation(['Makerere University, Kampala, Uganda'])).toBe(
      false,
    );
  });

  it('recognizes air-quality research and excludes unrelated author works', () => {
    expect(isAirQualityTopic('AirQo sensor kit for PM2.5 monitoring')).toBe(
      true,
    );
    expect(
      isAirQualityTopic('A labelled image dataset of Ugandan banknotes'),
    ).toBe(false);
  });
});
