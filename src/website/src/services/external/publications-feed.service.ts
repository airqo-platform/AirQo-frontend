import {
  PUBLICATIONS_FEED_DEFAULT_PAGE_SIZE,
  PUBLICATIONS_FEED_MAX_PAGE_SIZE,
  PUBLICATIONS_FEED_REVALIDATE_SECONDS,
} from '@/config/publications.config';
import { API_ROUTES } from '@/services/api/api-routes';
import type {
  LivePublication,
  LivePublicationFeedSettings,
  LivePublicationMetadataOverride,
  LivePublicationsResponse,
  PublicationFeedProvider,
} from '@/types/publications-feed';

const REQUEST_TIMEOUT_MS = 15_000;
const SETTINGS_REQUEST_TIMEOUT_MS = 5_000;
const OVERRIDES_REQUEST_TIMEOUT_MS = 5_000;
const MAX_PUBLICATION_OVERRIDE_IDENTIFIERS = 100;
const OPENALEX_PAGE_SIZE = 100;
const CROSSREF_PAGE_SIZE = 100;
const AIRQO_AFFILIATION_PATTERN = /\bair\s*qo\b/i;
const AIR_QUALITY_TOPIC_PATTERN =
  /\bair\b|pollution|\bpm\s*(?:2(?:\.\d+)?|10)\b|particulate matter|sensor|monitoring|clean air|atmospher/i;

type OpenAlexLocation = {
  landing_page_url?: string | null;
  pdf_url?: string | null;
  source?: { display_name?: string | null } | null;
};

type OpenAlexWork = {
  id?: string;
  title?: string | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  publication_year?: number | null;
  publication_date?: string | null;
  doi?: string | null;
  authorships?: Array<{
    author?: { display_name?: string | null } | null;
    institutions?: Array<{ display_name?: string | null }>;
    raw_affiliation_strings?: string[];
  }>;
  primary_location?: OpenAlexLocation | null;
  best_oa_location?: OpenAlexLocation | null;
  open_access?: { is_oa?: boolean; oa_url?: string | null } | null;
};

type CrossrefWork = {
  DOI?: string;
  title?: string[];
  abstract?: string;
  author?: Array<{
    given?: string;
    family?: string;
    name?: string;
    affiliation?: Array<{ name?: string }>;
  }>;
  published?: { 'date-parts'?: number[][] };
  created?: { 'date-time'?: string };
  'container-title'?: string[];
  URL?: string;
  link?: Array<{ URL?: string; content_type?: string }>;
};

type ProviderResult<T> = {
  provider: PublicationFeedProvider;
  results: T[];
};

export class PublicationsFeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicationsFeedError';
  }
}

const toPositiveInteger = (value: number | undefined, fallback: number) => {
  if (!Number.isFinite(value) || !value || value < 1) return fallback;
  return Math.floor(value);
};

const normalizeDoi = (doi?: string | null): string | undefined => {
  if (!doi) return undefined;

  return doi
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .toLowerCase();
};

const normalizeTitle = (title?: string | null): string =>
  (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const isAirQualityTopic = (value?: string | null): boolean =>
  Boolean(value && AIR_QUALITY_TOPIC_PATTERN.test(value));

export const hasAirQoAffiliation = (
  affiliations: Array<string | null | undefined>,
): boolean =>
  affiliations.some((affiliation) =>
    AIRQO_AFFILIATION_PATTERN.test(affiliation || ''),
  );

const PUBLICATION_TEXT_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

export const normalizePublicationText = (
  value?: string | null,
): string | undefined => {
  if (!value) return undefined;

  const withoutTags = value.replace(/<[^>]*>/g, '');
  const decoded = withoutTags.replace(
    /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
    (entity) => PUBLICATION_TEXT_ENTITIES[entity] ?? entity,
  );
  const normalized = decoded.replace(/\s+/g, ' ').trim();

  return normalized || undefined;
};

const getPublicationKey = (publication: LivePublication): string =>
  publication.doi
    ? `doi:${normalizeDoi(publication.doi)}`
    : `title:${normalizeTitle(publication.title)}`;

const getDoiUrl = (doi?: string): string | undefined =>
  doi ? `https://doi.org/${doi}` : undefined;

const getOpenAlexRecordUrl = (id?: string): string => {
  if (!id) return '';
  return id.startsWith('http')
    ? id.replace(/^https?:\/\/openalex\.org\//, 'https://openalex.org/')
    : `https://openalex.org/${id}`;
};

export const formatCrossrefDateParts = (
  dateParts?: number[],
): string | undefined => {
  if (!dateParts?.length) return undefined;

  return dateParts
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, '0'),
    )
    .join('-');
};

const rebuildAbstract = (
  invertedIndex?: Record<string, number[]> | null,
): string | undefined => {
  if (!invertedIndex) return undefined;

  return (
    Object.entries(invertedIndex)
      .flatMap(([word, positions]) =>
        positions.map((position) => ({ word, position })),
      )
      .sort((left, right) => left.position - right.position)
      .map(({ word }) => word)
      .join(' ')
      .trim() || undefined
  );
};

const getFirstNonEmpty = (...values: Array<string | null | undefined>) =>
  values.find((value) => Boolean(value && value.trim()))?.trim();

/**
 * Resolve a publication to its most authoritative public destination.
 *
 * A DOI is preferred because it is the persistent identifier for the exact
 * work and resolves to the publisher's current landing page. OpenAlex's
 * record is retained as the final fallback for works without a DOI.
 */
export const getCanonicalPublicationUrl = ({
  doi,
  landingPageUrl,
  openAlexId,
}: {
  doi?: string | null;
  landingPageUrl?: string | null;
  openAlexId?: string | null;
}): string | undefined =>
  getFirstNonEmpty(
    getDoiUrl(normalizeDoi(doi)),
    landingPageUrl,
    getOpenAlexRecordUrl(openAlexId?.trim()),
  );

const toOpenAlexPublication = (work: OpenAlexWork): LivePublication | null => {
  const title = normalizePublicationText(work.title);
  const id = work.id?.trim();

  if (!title || !id) return null;

  const doi = normalizeDoi(work.doi);
  const bestOpenAccessUrl = getFirstNonEmpty(
    work.best_oa_location?.landing_page_url,
    work.best_oa_location?.pdf_url,
    work.open_access?.oa_url,
  );
  const primaryUrl = getCanonicalPublicationUrl({
    doi,
    landingPageUrl: work.primary_location?.landing_page_url,
    openAlexId: id,
  });

  if (!primaryUrl) return null;

  return {
    id,
    title,
    authors:
      work.authorships
        ?.map((authorship) =>
          normalizePublicationText(authorship.author?.display_name),
        )
        .filter((author): author is string => Boolean(author)) || [],
    abstract: rebuildAbstract(work.abstract_inverted_index),
    journal: normalizePublicationText(
      getFirstNonEmpty(work.primary_location?.source?.display_name),
    ),
    year: work.publication_year || undefined,
    publishedDate: work.publication_date || undefined,
    doi,
    url: primaryUrl,
    openAccessUrl: bestOpenAccessUrl,
    source: 'openalex',
    sourceLabel: 'OpenAlex',
    sourceRecordUrl: getOpenAlexRecordUrl(id),
    isOpenAccess: work.open_access?.is_oa,
  };
};

const toCrossrefPublication = (work: CrossrefWork): LivePublication | null => {
  const title = normalizePublicationText(work.title?.[0]);
  const doi = normalizeDoi(work.DOI);

  if (!title || !doi) return null;

  const doiUrl = getDoiUrl(doi);
  if (!doiUrl) return null;

  const dateParts = work.published?.['date-parts']?.[0];
  const publishedDate =
    formatCrossrefDateParts(dateParts) || work.created?.['date-time'];

  return {
    id: `crossref:${doi}`,
    title,
    authors:
      work.author
        ?.map((author) =>
          normalizePublicationText(
            getFirstNonEmpty(
              author.name,
              [author.given, author.family].filter(Boolean).join(' '),
            ),
          ),
        )
        .filter((author): author is string => Boolean(author)) || [],
    journal: normalizePublicationText(
      getFirstNonEmpty(work['container-title']?.[0]),
    ),
    abstract: normalizePublicationText(work.abstract),
    year: dateParts?.[0],
    publishedDate,
    doi,
    url: doiUrl,
    source: 'crossref',
    sourceLabel: 'Crossref',
    sourceRecordUrl: doiUrl,
  };
};

const mergePublication = (
  current: LivePublication,
  incoming: LivePublication,
): LivePublication => ({
  ...current,
  authors: current.authors.length ? current.authors : incoming.authors,
  abstract: current.abstract || incoming.abstract,
  journal: current.journal || incoming.journal,
  year: current.year || incoming.year,
  publishedDate: current.publishedDate || incoming.publishedDate,
  doi: current.doi || incoming.doi,
  openAccessUrl: current.openAccessUrl || incoming.openAccessUrl,
  isOpenAccess: current.isOpenAccess ?? incoming.isOpenAccess,
  sourceRecordUrl: current.sourceRecordUrl || incoming.sourceRecordUrl,
});

export const mergePublicationResults = (
  providerResults: Array<ProviderResult<LivePublication>>,
): LivePublication[] => {
  const merged = new Map<string, LivePublication>();

  providerResults.forEach(({ results }) => {
    results.forEach((publication) => {
      const key = getPublicationKey(publication);
      const existing = merged.get(key);
      merged.set(
        key,
        existing ? mergePublication(existing, publication) : publication,
      );
    });
  });

  return [...merged.values()].sort((left, right) => {
    const leftDate = left.publishedDate || `${left.year || 0}-01-01`;
    const rightDate = right.publishedDate || `${right.year || 0}-01-01`;
    return rightDate.localeCompare(leftDate);
  });
};

const getPublicationOverrideIdentifiers = (
  publication: LivePublication,
): string[] => {
  const identifiers: string[] = [];
  const doi = normalizeDoi(publication.doi);

  if (doi) identifiers.push(`doi:${doi}`);

  const openAlexId = publication.id.match(
    /(?:openalex\.org\/|^openalex:)([A-Za-z0-9]+)/i,
  )?.[1];
  if (openAlexId) identifiers.push(`openalex:${openAlexId}`);

  return identifiers;
};

const getWebsiteApiUrl = () => process.env.API_URL;

const isLivePublicationFeedSettings = (
  value: unknown,
): value is LivePublicationFeedSettings => {
  if (!value || typeof value !== 'object') return false;

  const settings = value as Record<string, unknown>;
  return (
    typeof settings.enabled === 'boolean' &&
    Array.isArray(settings.openalex_author_ids) &&
    settings.openalex_author_ids.every((item) => typeof item === 'string') &&
    Array.isArray(settings.allowed_affiliations) &&
    settings.allowed_affiliations.every((item) => typeof item === 'string') &&
    Array.isArray(settings.relevance_keywords) &&
    settings.relevance_keywords.every((item) => typeof item === 'string') &&
    typeof settings.relevance_required === 'boolean' &&
    typeof settings.openalex_api_url === 'string' &&
    typeof settings.crossref_api_url === 'string' &&
    typeof settings.crossref_mailto === 'string' &&
    typeof settings.updated_at === 'string'
  );
};

const validateProviderEndpoint = (
  value: string,
  expectedHostname: string,
): string => {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== expectedHostname ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash ||
      url.pathname.replace(/\/+$/, '') !== '/works'
    ) {
      throw new Error('invalid provider endpoint');
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    throw new PublicationsFeedError(
      `The website backend returned an invalid ${expectedHostname} endpoint`,
    );
  }
};

const normalizeSettingsList = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const fetchLivePublicationFeedSettings =
  async (): Promise<LivePublicationFeedSettings> => {
    const apiUrl = getWebsiteApiUrl();
    if (!apiUrl) {
      throw new PublicationsFeedError(
        'The website backend URL is not configured for publication feed settings',
      );
    }

    const url = new URL(
      API_ROUTES.WEBSITE.LIVE_PUBLICATION_FEED_SETTINGS,
      apiUrl,
    );
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(SETTINGS_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new PublicationsFeedError(
        `Publication feed settings request failed with ${response.status}`,
      );
    }

    const payload: unknown = await response.json();
    if (!isLivePublicationFeedSettings(payload)) {
      throw new PublicationsFeedError(
        'The website backend returned invalid publication feed settings',
      );
    }

    return {
      ...payload,
      openalex_author_ids: Array.from(
        new Set(
          payload.openalex_author_ids
            .map((authorId) => authorId.trim().toUpperCase())
            .filter((authorId) => /^A\d+$/.test(authorId)),
        ),
      ),
      allowed_affiliations: normalizeSettingsList(payload.allowed_affiliations),
      relevance_keywords: normalizeSettingsList(payload.relevance_keywords),
      openalex_api_url: validateProviderEndpoint(
        payload.openalex_api_url,
        'api.openalex.org',
      ),
      crossref_api_url: validateProviderEndpoint(
        payload.crossref_api_url,
        'api.crossref.org',
      ),
      crossref_mailto: payload.crossref_mailto.trim(),
    };
  };

export const applyLivePublicationOverrides = (
  publications: LivePublication[],
  overrides: LivePublicationMetadataOverride[],
): LivePublication[] => {
  const overridesByIdentifier = new Map(
    overrides.map((override) => [override.external_identifier, override]),
  );

  return publications.map((publication) => {
    const override = getPublicationOverrideIdentifiers(publication)
      .map((identifier) => overridesByIdentifier.get(identifier))
      .find(Boolean);

    if (!override) return publication;

    const authors = (Array.isArray(override.authors) ? override.authors : [])
      .filter((author): author is string => typeof author === 'string')
      .map((author) => author.trim())
      .filter(Boolean);
    const journal =
      typeof override.journal === 'string' ? override.journal.trim() : '';

    return {
      ...publication,
      authors: authors.length ? authors : publication.authors,
      journal: journal || publication.journal,
    };
  });
};

const isLivePublicationMetadataOverride = (
  value: unknown,
): value is LivePublicationMetadataOverride => {
  if (!value || typeof value !== 'object') return false;

  const override = value as Record<string, unknown>;
  return (
    typeof override.external_identifier === 'string' &&
    Array.isArray(override.authors) &&
    override.authors.every((author) => typeof author === 'string') &&
    (override.journal === null ||
      override.journal === undefined ||
      typeof override.journal === 'string')
  );
};

const fetchLivePublicationOverrides = async (
  publications: LivePublication[],
): Promise<LivePublicationMetadataOverride[]> => {
  const apiUrl = getWebsiteApiUrl();
  if (!apiUrl || !publications.length) return [];

  const identifiers = [
    ...new Set(publications.flatMap(getPublicationOverrideIdentifiers)),
  ];
  if (!identifiers.length) return [];
  if (identifiers.length > MAX_PUBLICATION_OVERRIDE_IDENTIFIERS) {
    throw new PublicationsFeedError(
      'Too many publication metadata identifiers to resolve',
    );
  }

  const url = new URL(API_ROUTES.WEBSITE.LIVE_PUBLICATION_OVERRIDES, apiUrl);
  identifiers.forEach((identifier) =>
    url.searchParams.append('identifier', identifier),
  );

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(OVERRIDES_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new PublicationsFeedError(
      `Publication metadata overrides request failed with ${response.status}`,
    );
  }

  const payload: unknown = await response.json();
  const overrides = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && 'results' in payload
      ? payload.results
      : undefined;
  return Array.isArray(overrides)
    ? overrides.filter(isLivePublicationMetadataOverride)
    : [];
};

const fetchJson = async <T>(
  url: URL,
  headers: Record<string, string> = {},
  policyVersion?: string,
): Promise<T> => {
  const requestHeaders = { ...headers };
  if (policyVersion) {
    // This keeps Next's provider cache key aligned with the admin policy while
    // retaining the six-hour TTL for an unchanged policy.
    requestHeaders['X-AirQo-Policy-Version'] = policyVersion;
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...requestHeaders,
    },
    next: { revalidate: PUBLICATIONS_FEED_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new PublicationsFeedError(
      `Provider request failed with ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
};

const normalizePolicyText = (value?: string | null): string =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const matchesAnyPolicyTerm = (value: string, terms: string[]): boolean => {
  const normalizedValue = ` ${normalizePolicyText(value)} `;
  return terms.some((term) => {
    const normalizedTerm = normalizePolicyText(term);
    return Boolean(
      normalizedTerm && normalizedValue.includes(` ${normalizedTerm} `),
    );
  });
};

const matchesPublicationPolicy = (
  titleAndAbstract: string,
  affiliations: string[],
  settings: LivePublicationFeedSettings,
): boolean => {
  if (!settings.relevance_required) return true;

  return (
    affiliations.some((affiliation) =>
      matchesAnyPolicyTerm(affiliation, settings.allowed_affiliations),
    ) || matchesAnyPolicyTerm(titleAndAbstract, settings.relevance_keywords)
  );
};

const getOpenAlexQueries = (settings: LivePublicationFeedSettings) => {
  if (settings.openalex_author_ids.length) {
    return [
      {
        parameter: 'filter',
        value: `authorships.author.id:${settings.openalex_author_ids.join('|')}`,
      },
    ];
  }

  const searchTerms = settings.allowed_affiliations.length
    ? settings.allowed_affiliations
    : settings.relevance_keywords.slice(0, 5);
  return searchTerms.slice(0, 5).map((value) => ({
    parameter: 'search',
    value,
  }));
};

const fetchOpenAlex = async (
  settings: LivePublicationFeedSettings,
): Promise<ProviderResult<LivePublication>> => {
  const apiKey = process.env.OPENALEX_API_KEY?.trim();
  if (!apiKey) {
    throw new PublicationsFeedError(
      'OPENALEX_API_KEY is not configured on the website server',
    );
  }

  const queries = getOpenAlexQueries(settings);
  if (!queries.length) return { provider: 'openalex', results: [] };

  const payloads = await Promise.all(
    queries.map((query) => {
      const url = new URL(settings.openalex_api_url);
      url.searchParams.set('per_page', String(OPENALEX_PAGE_SIZE));
      url.searchParams.set('sort', 'publication_date:desc');
      url.searchParams.set(
        'select',
        [
          'id',
          'title',
          'abstract_inverted_index',
          'publication_year',
          'publication_date',
          'doi',
          'authorships',
          'primary_location',
          'best_oa_location',
          'open_access',
        ].join(','),
      );
      url.searchParams.set(query.parameter, query.value);

      return fetchJson<{ results?: OpenAlexWork[] }>(
        url,
        {
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'AirQo publications feed; https://airqo.net',
        },
        settings.updated_at,
      );
    }),
  );

  const works = payloads.flatMap((payload) => payload.results || []);

  return {
    provider: 'openalex',
    results: works
      .filter((work) => {
        const affiliations =
          work.authorships?.flatMap((authorship) => [
            ...(authorship.raw_affiliation_strings || []),
            ...(authorship.institutions || []).map(
              (institution) => institution.display_name || '',
            ),
          ]) || [];
        const abstract = rebuildAbstract(work.abstract_inverted_index);

        return matchesPublicationPolicy(
          `${work.title || ''} ${abstract || ''}`,
          affiliations,
          settings,
        );
      })
      .map(toOpenAlexPublication)
      .filter((publication): publication is LivePublication =>
        Boolean(publication),
      ),
  };
};

const fetchCrossref = async (
  settings: LivePublicationFeedSettings,
): Promise<ProviderResult<LivePublication>> => {
  const affiliations = settings.allowed_affiliations.slice(0, 5);
  if (!affiliations.length) return { provider: 'crossref', results: [] };

  const payloads = await Promise.all(
    affiliations.map((affiliation) => {
      const url = new URL(settings.crossref_api_url);
      url.searchParams.set('query.affiliation', affiliation);
      url.searchParams.set('rows', String(CROSSREF_PAGE_SIZE));
      url.searchParams.set('sort', 'published');
      url.searchParams.set('order', 'desc');
      url.searchParams.set(
        'select',
        'DOI,title,abstract,author,published,created,container-title,URL,link',
      );
      if (settings.crossref_mailto) {
        url.searchParams.set('mailto', settings.crossref_mailto);
      }

      const headers: Record<string, string> = {};
      if (settings.crossref_mailto) {
        headers['User-Agent'] =
          `AirQo publications feed; mailto:${settings.crossref_mailto}`;
      }

      return fetchJson<{ message?: { items?: CrossrefWork[] } }>(
        url,
        headers,
        settings.updated_at,
      );
    }),
  );

  return {
    provider: 'crossref',
    results: payloads
      .flatMap((payload) => payload.message?.items || [])
      .filter((work) => {
        const affiliations =
          work.author?.flatMap((author) =>
            (author.affiliation || []).map(
              (affiliation) => affiliation.name || '',
            ),
          ) || [];
        const title = work.title?.join(' ') || '';
        const abstract = normalizePublicationText(work.abstract) || '';

        return matchesPublicationPolicy(
          `${title} ${abstract}`,
          affiliations,
          settings,
        );
      })
      .map(toCrossrefPublication)
      .filter((publication): publication is LivePublication =>
        Boolean(publication),
      ),
  };
};

export async function getLivePublications(
  options: {
    page?: number;
    pageSize?: number;
  } = {},
): Promise<LivePublicationsResponse> {
  const page = toPositiveInteger(options.page, 1);
  const pageSize = Math.min(
    toPositiveInteger(options.pageSize, PUBLICATIONS_FEED_DEFAULT_PAGE_SIZE),
    PUBLICATIONS_FEED_MAX_PAGE_SIZE,
  );
  const settings = await fetchLivePublicationFeedSettings();

  if (!settings.enabled) {
    return {
      enabled: false,
      results: [],
      count: 0,
      pageSize,
      totalPages: 0,
      currentPage: page,
      updatedAt: new Date().toISOString(),
      providers: [],
    };
  }

  const providerResults = await Promise.allSettled([
    fetchOpenAlex(settings),
    fetchCrossref(settings),
  ]);
  providerResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      const provider = index === 0 ? 'OpenAlex' : 'Crossref';
      console.warn(
        `Live publications ${provider} request failed:`,
        result.reason instanceof Error
          ? result.reason.message
          : 'Unknown error',
      );
    }
  });
  const successfulResults = providerResults
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<ProviderResult<LivePublication>> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value);

  if (!successfulResults.length) {
    // Provider outages should not block the website. The resources page can
    // continue showing curated AirQo publications while the live feed is
    // temporarily unavailable.
    return {
      enabled: true,
      results: [],
      count: 0,
      pageSize,
      totalPages: 0,
      currentPage: page,
      updatedAt: new Date().toISOString(),
      providers: [],
      degraded: true,
    };
  }

  const results = mergePublicationResults(successfulResults);
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  let pageResults = results.slice(start, start + pageSize);

  try {
    const overrides = await fetchLivePublicationOverrides(pageResults);
    pageResults = applyLivePublicationOverrides(pageResults, overrides);
  } catch (error) {
    console.warn(
      'Live publication metadata overrides could not be loaded:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }

  return {
    enabled: true,
    results: pageResults,
    count: results.length,
    pageSize,
    totalPages,
    currentPage,
    updatedAt: new Date().toISOString(),
    providers: successfulResults.map(({ provider }) => provider),
  };
}
