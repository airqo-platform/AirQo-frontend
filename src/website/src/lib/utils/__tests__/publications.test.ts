import {
  mergePublicationLists,
  selectHomepagePublications,
} from '@/lib/utils/publications';
import type { LivePublication } from '@/types/publications-feed';

const createLivePublication = (
  overrides: Partial<LivePublication> = {},
): LivePublication => ({
  id: 'openalex:live-only',
  title: 'Live-only air quality study',
  authors: ['Researcher One'],
  url: 'https://doi.org/10.1234/live-only',
  source: 'openalex',
  sourceLabel: 'OpenAlex',
  sourceRecordUrl: 'https://openalex.org/W1',
  ...overrides,
});

describe('mergePublicationLists', () => {
  it('keeps curated records OpenAlex does not index and merges duplicate metadata', () => {
    const results = mergePublicationLists(
      [
        {
          id: 'curated-only',
          resource_title: 'A curated paper missing from OpenAlex',
          resource_authors: 'Researcher Curated',
          description: 'A curated summary.',
          link: 'https://publisher.example/curated-paper',
        },
        {
          id: 'curated-duplicate',
          title: 'Air quality study',
          authors: ['Researcher Curated'],
          doi: '10.1234/shared-paper',
          description: 'Curated abstract.',
        },
      ],
      [
        createLivePublication({
          id: 'openalex:shared',
          title: 'Air quality study',
          doi: 'https://doi.org/10.1234/shared-paper',
          authors: ['Researcher Live'],
          publishedDate: '2024-01-01',
        }),
      ],
    );

    expect(results).toHaveLength(2);
    expect(
      results.find(
        (publication) =>
          publication.title === 'A curated paper missing from OpenAlex',
      ),
    ).toMatchObject({
      source: 'curated',
      sourceLabels: ['AirQo'],
      description: 'A curated summary.',
    });
    expect(
      results.find(
        (publication) =>
          publication.doi === 'https://doi.org/10.1234/shared-paper',
      ),
    ).toMatchObject({
      id: 'openalex:shared',
      source: 'openalex',
      sourceLabels: ['AirQo', 'OpenAlex'],
      authors: ['Researcher Live'],
      description: 'Curated abstract.',
      doi: 'https://doi.org/10.1234/shared-paper',
    });
  });

  it('deduplicates records without DOIs by normalized title', () => {
    const results = mergePublicationLists(
      [
        {
          title: 'Air Quality in Kampala!',
          resource_authors: 'Researcher One',
        },
      ],
      [
        createLivePublication({
          title: 'Air quality in Kampala',
          doi: undefined,
        }),
      ],
    );

    expect(results).toHaveLength(1);
    expect(results[0].sourceLabels).toEqual(['AirQo', 'OpenAlex']);
  });

  it('matches spacing variants in scientific titles such as PM2.5', () => {
    const results = mergePublicationLists(
      [
        {
          title:
            'Transferability of Machine Learning-Based Calibration Models for Low-Cost PM 2.5 Sensors',
        },
      ],
      [
        createLivePublication({
          title:
            'Transferability of Machine Learning Based Calibration Models for Low Cost PM2.5 Sensors',
          doi: undefined,
        }),
      ],
    );

    expect(results).toHaveLength(1);
    expect(results[0].sourceLabels).toEqual(['AirQo', 'OpenAlex']);
  });

  it('matches Unicode compatibility variants such as PM₂.₅', () => {
    const results = mergePublicationLists(
      [{ title: 'PM₂.₅ sensors in Kampala' }],
      [
        createLivePublication({
          title: 'PM2.5 sensors in Kampala',
          doi: undefined,
        }),
      ],
    );

    expect(results).toHaveLength(1);
    expect(results[0].sourceLabels).toEqual(['AirQo', 'OpenAlex']);
  });

  it('prefers the first HTTPS curated URL and falls back when none is HTTPS', () => {
    const results = mergePublicationLists([
      {
        title: 'Curated publication with URL candidates',
        url: 'http://publisher.example/publication',
        link: 'https://publisher.example/publication',
      },
      {
        title: 'Curated publication without HTTPS URL',
        url: 'http://publisher.example/fallback',
        link: 'publisher.example/no-scheme',
      },
    ]);

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Curated publication with URL candidates',
          url: 'https://publisher.example/publication',
        }),
        expect.objectContaining({
          title: 'Curated publication without HTTPS URL',
          url: 'http://publisher.example/fallback',
        }),
      ]),
    );
  });

  it('keeps a curated paper in the three-item homepage selection', () => {
    const merged = mergePublicationLists(
      [{ title: 'Curated paper missing from OpenAlex', year: 2022 }],
      [
        createLivePublication({
          id: 'openalex:1',
          title: 'Live paper one',
          year: 2026,
        }),
        createLivePublication({
          id: 'openalex:2',
          title: 'Live paper two',
          year: 2026,
        }),
        createLivePublication({
          id: 'openalex:3',
          title: 'Live paper three',
          year: 2026,
        }),
        createLivePublication({
          id: 'openalex:4',
          title: 'Live paper four',
          year: 2026,
        }),
      ],
    );

    const selected = selectHomepagePublications(merged);

    expect(selected).toHaveLength(3);
    expect(
      selected.some((publication) =>
        publication.sourceLabels.includes('AirQo'),
      ),
    ).toBe(true);
  });
});
