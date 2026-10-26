import type { LivePublication } from '@/types/publications-feed';

export interface CuratedPublication {
  id?: string | number;
  title?: string;
  resource_title?: string;
  authors?: string | string[];
  resource_authors?: string | string[];
  abstract?: string;
  description?: string;
  journal?: string;
  publication_journal?: string;
  publication_name?: string;
  year?: number | string;
  publication_year?: number | string;
  publishedDate?: string;
  published_date?: string;
  publication_date?: string;
  date?: string;
  doi?: string;
  resource_doi?: string;
  url?: string;
  link?: string;
  resource_file_url?: string;
  openAccessUrl?: string;
  open_access_url?: string;
}

export type PublicationFeedItem = {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  description?: string;
  journal?: string;
  year?: number;
  publishedDate?: string;
  doi?: string;
  url?: string;
  openAccessUrl?: string;
  source: 'curated' | LivePublication['source'];
  sourceLabels: string[];
};

const firstNonEmpty = (...values: Array<string | null | undefined>) =>
  values.find((value) => Boolean(value?.trim()))?.trim();

const normalizeDoi = (value?: string) =>
  value
    ?.trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .toLowerCase();

const normalizeTitle = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const toStringArray = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return (
    value
      ?.split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean) || []
  );
};

const toYear = (value?: number | string): number | undefined => {
  const year = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(year) && year > 0 ? year : undefined;
};

const toCuratedFeedItem = (
  publication: CuratedPublication,
): PublicationFeedItem | null => {
  const title = firstNonEmpty(publication.title, publication.resource_title);
  if (!title) return null;

  const doi = firstNonEmpty(publication.doi, publication.resource_doi);
  const publishedDate = firstNonEmpty(
    publication.publishedDate,
    publication.published_date,
    publication.publication_date,
    publication.date,
  );
  const year =
    toYear(publication.year) ||
    toYear(publication.publication_year) ||
    toYear(publishedDate?.slice(0, 4));
  const key = doi
    ? `doi:${normalizeDoi(doi)}`
    : `title:${normalizeTitle(title)}`;

  return {
    id: `curated:${publication.id ?? key}`,
    title,
    authors: toStringArray(publication.authors || publication.resource_authors),
    abstract: firstNonEmpty(publication.abstract),
    description: firstNonEmpty(publication.description),
    journal: firstNonEmpty(
      publication.journal,
      publication.publication_journal,
      publication.publication_name,
    ),
    year,
    publishedDate,
    doi,
    url: firstNonEmpty(
      publication.url,
      publication.link,
      publication.resource_file_url,
    ),
    openAccessUrl: firstNonEmpty(
      publication.openAccessUrl,
      publication.open_access_url,
      publication.resource_file_url,
    ),
    source: 'curated',
    sourceLabels: ['AirQo'],
  };
};

const mergePublication = (
  current: PublicationFeedItem,
  incoming: PublicationFeedItem,
): PublicationFeedItem => {
  const preferred = incoming.source === 'curated' ? current : incoming;

  return {
    ...current,
    ...incoming,
    id: preferred.id,
    title: preferred.title,
    authors: incoming.authors.length ? incoming.authors : current.authors,
    abstract: incoming.abstract || current.abstract,
    description: incoming.description || current.description,
    journal: incoming.journal || current.journal,
    year: incoming.year || current.year,
    publishedDate: incoming.publishedDate || current.publishedDate,
    doi: incoming.doi || current.doi,
    url: incoming.url || current.url,
    openAccessUrl: incoming.openAccessUrl || current.openAccessUrl,
    source: preferred.source,
    sourceLabels: [
      ...new Set([...current.sourceLabels, ...incoming.sourceLabels]),
    ],
  };
};

const getSortDate = (publication: PublicationFeedItem) => {
  const timestamp = publication.publishedDate
    ? Date.parse(publication.publishedDate)
    : Number.NaN;
  if (Number.isFinite(timestamp)) return timestamp;

  return publication.year ? Date.UTC(publication.year, 0, 1) : 0;
};

export const mergePublicationLists = (
  curatedPublications: CuratedPublication[],
  livePublications: LivePublication[] = [],
): PublicationFeedItem[] => {
  const merged: PublicationFeedItem[] = [];
  const doiIndexes = new Map<string, number>();
  const titleIndexes = new Map<string, number[]>();

  const addPublication = (publication: PublicationFeedItem) => {
    const doiKey = normalizeDoi(publication.doi);
    const titleKey = normalizeTitle(publication.title);
    const titleCandidates = titleIndexes.get(titleKey) || [];
    const matchingTitleIndex = titleCandidates.find((index) => {
      const existingDoi = normalizeDoi(merged[index].doi);
      return !doiKey || !existingDoi || doiKey === existingDoi;
    });
    const existingIndex =
      (doiKey ? doiIndexes.get(doiKey) : undefined) ?? matchingTitleIndex;

    if (existingIndex !== undefined) {
      merged[existingIndex] = mergePublication(
        merged[existingIndex],
        publication,
      );
      if (doiKey) doiIndexes.set(doiKey, existingIndex);
      if (!titleCandidates.includes(existingIndex)) {
        titleIndexes.set(titleKey, [...titleCandidates, existingIndex]);
      }
      return;
    }

    const index = merged.push(publication) - 1;
    if (doiKey) doiIndexes.set(doiKey, index);
    titleIndexes.set(titleKey, [...titleCandidates, index]);
  };

  curatedPublications.forEach((publication) => {
    const item = toCuratedFeedItem(publication);
    if (item) addPublication(item);
  });

  livePublications.forEach((publication) => {
    addPublication({
      id: publication.id,
      title: publication.title,
      authors: publication.authors,
      abstract: publication.abstract,
      journal: publication.journal,
      year: publication.year,
      publishedDate: publication.publishedDate,
      doi: publication.doi,
      url: publication.url,
      openAccessUrl: publication.openAccessUrl,
      source: publication.source,
      sourceLabels: [publication.sourceLabel],
    });
  });

  return merged.sort((left, right) => getSortDate(right) - getSortDate(left));
};

export const selectHomepagePublications = (
  publications: PublicationFeedItem[],
  limit = 3,
): PublicationFeedItem[] => {
  if (limit <= 0 || publications.length === 0) return [];

  const selected = publications.slice(0, limit);
  const curatedPublication = publications.find((publication) =>
    publication.sourceLabels.includes('AirQo'),
  );

  if (
    curatedPublication &&
    !selected.some((publication) => publication.sourceLabels.includes('AirQo'))
  ) {
    selected[selected.length - 1] = curatedPublication;
    selected.sort((left, right) => getSortDate(right) - getSortDate(left));
  }

  return selected;
};
