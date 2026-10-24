import {
  getPublicationsFeedConfig,
  PUBLICATIONS_FEED_DEFAULT_PAGE_SIZE,
  PUBLICATIONS_FEED_MAX_PAGE_SIZE,
  PUBLICATIONS_FEED_REVALIDATE_SECONDS,
} from '@/config/publications.config';
import type {
  LivePublication,
  LivePublicationsResponse,
  PublicationFeedProvider,
} from '@/types/publications-feed';

const REQUEST_TIMEOUT_MS = 15_000;
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

  const authorAffiliations =
    work.author?.flatMap((author) =>
      author.affiliation?.map((affiliation) => affiliation.name),
    ) || [];

  if (!hasAirQoAffiliation(authorAffiliations) || !isAirQualityTopic(title)) {
    return null;
  }

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
    year: dateParts?.[0],
    publishedDate,
    doi,
    url: doiUrl,
    openAccessUrl: work.link?.find(
      (link) => link.content_type === 'application/pdf',
    )?.URL,
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

const fetchJson = async <T>(
  url: URL,
  headers: HeadersInit = {},
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...headers,
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

const getOpenAlexFilter = (
  config: ReturnType<typeof getPublicationsFeedConfig>,
) => {
  if (config.openAlexWorksFilter) return config.openAlexWorksFilter;

  if (config.openAlexInstitutionId) {
    return `authorships.institutions.id:${config.openAlexInstitutionId}`;
  }

  if (config.openAlexAuthorIds.length) {
    return `authorships.author.id:${config.openAlexAuthorIds.join('|')}`;
  }

  return undefined;
};

const fetchOpenAlex = async (
  config: ReturnType<typeof getPublicationsFeedConfig>,
): Promise<ProviderResult<LivePublication>> => {
  const url = new URL(config.openAlexApiUrl);
  const filter = getOpenAlexFilter(config);

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

  if (filter) {
    url.searchParams.set('filter', filter);
  } else {
    url.searchParams.set('search', 'AirQo');
  }

  if (config.openAlexApiKey) {
    url.searchParams.set('api_key', config.openAlexApiKey);
  }

  const payload = await fetchJson<{ results?: OpenAlexWork[] }>(url, {
    'User-Agent': 'AirQo publications feed; https://airqo.net',
  });

  return {
    provider: 'openalex',
    results: (payload.results || [])
      .filter((work) => {
        if (!config.openAlexRelevanceRequired) return true;

        const affiliations =
          work.authorships?.flatMap(
            (authorship) => authorship.raw_affiliation_strings || [],
          ) || [];
        const abstract = rebuildAbstract(work.abstract_inverted_index);

        return (
          hasAirQoAffiliation(affiliations) ||
          isAirQualityTopic(`${work.title || ''} ${abstract || ''}`)
        );
      })
      .map(toOpenAlexPublication)
      .filter((publication): publication is LivePublication =>
        Boolean(publication),
      ),
  };
};

const fetchCrossref = async (
  config: ReturnType<typeof getPublicationsFeedConfig>,
): Promise<ProviderResult<LivePublication>> => {
  const url = new URL(config.crossrefApiUrl);
  url.searchParams.set('query.affiliation', config.crossrefAffiliation);
  url.searchParams.set('rows', String(CROSSREF_PAGE_SIZE));
  url.searchParams.set('sort', 'published');
  url.searchParams.set('order', 'desc');
  url.searchParams.set(
    'select',
    'DOI,title,author,published,created,container-title,URL,link',
  );

  if (config.crossrefMailto) {
    url.searchParams.set('mailto', config.crossrefMailto);
  }

  const userAgent = config.crossrefMailto
    ? `AirQo publications feed; mailto:${config.crossrefMailto}`
    : 'AirQo publications feed; https://airqo.net';
  const payload = await fetchJson<{ message?: { items?: CrossrefWork[] } }>(
    url,
    {
      'User-Agent': userAgent,
    },
  );

  return {
    provider: 'crossref',
    results: (payload.message?.items || [])
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
  const config = getPublicationsFeedConfig();

  if (!config.enabled) {
    throw new PublicationsFeedError('The live publications feed is disabled');
  }

  const page = toPositiveInteger(options.page, 1);
  const pageSize = Math.min(
    toPositiveInteger(options.pageSize, PUBLICATIONS_FEED_DEFAULT_PAGE_SIZE),
    PUBLICATIONS_FEED_MAX_PAGE_SIZE,
  );

  const providerResults = await Promise.allSettled([
    fetchOpenAlex(config),
    fetchCrossref(config),
  ]);
  const successfulResults = providerResults
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<ProviderResult<LivePublication>> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value);

  if (!successfulResults.length) {
    throw new PublicationsFeedError('All publication providers failed');
  }

  const results = mergePublicationResults(successfulResults);
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    results: results.slice(start, start + pageSize),
    count: results.length,
    pageSize,
    totalPages,
    currentPage,
    updatedAt: new Date().toISOString(),
    providers: successfulResults.map(({ provider }) => provider),
  };
}
