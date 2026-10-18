import {
  getCanonicalPublicationUrl,
  hasAirQoAffiliation,
  isAirQualityTopic,
  mergePublicationResults,
  normalizePublicationText,
} from '@/services/external/publications-feed.service';
import type { LivePublication } from '@/types/publications-feed';

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
