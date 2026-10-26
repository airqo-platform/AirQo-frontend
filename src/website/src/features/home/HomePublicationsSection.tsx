'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useLivePublications, usePublications } from '@/hooks/useApiHooks';
import { getExternalLinkProps } from '@/lib/security/safeExternalLink';
import type { PublicationFeedItem } from '@/lib/utils/publications';
import {
  mergePublicationLists,
  selectHomepagePublications,
} from '@/lib/utils/publications';

const PAGE_SIZE = 4;
const HOMEPAGE_PUBLICATION_LIMIT = 3;

const formatPublicationDate = (publication: PublicationFeedItem) => {
  const value = publication.publishedDate;
  if (!value) return publication.year ? String(publication.year) : undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return publication.year ? String(publication.year) : undefined;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const getHttpsUrl = (value?: string): string | undefined => {
  if (!value?.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname ? value.trim() : undefined;
  } catch {
    return undefined;
  }
};

const PublicationCard = ({
  publication,
}: {
  publication: PublicationFeedItem;
}) => {
  const publicationDate = formatPublicationDate(publication);
  const publicationUrl =
    getHttpsUrl(publication.url) || getHttpsUrl(publication.openAccessUrl);
  const openAccessUrl = getHttpsUrl(publication.openAccessUrl);
  const separateOpenAccessUrl =
    openAccessUrl && openAccessUrl !== publicationUrl
      ? openAccessUrl
      : undefined;

  return (
    <article className="group flex h-56 flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex h-5 min-w-0 items-center gap-2 text-xs text-slate-500">
        {publicationDate && <span className="shrink-0">{publicationDate}</span>}
        {publicationDate && publication.journal && (
          <span aria-hidden="true">&middot;</span>
        )}
        {publication.journal && (
          <span className="truncate" title={publication.journal}>
            {publication.journal}
          </span>
        )}
      </div>

      <h3 className="mt-4 h-14 line-clamp-2 text-lg font-semibold leading-7 text-slate-900">
        {publicationUrl ? (
          <a
            href={publicationUrl}
            {...getExternalLinkProps(publicationUrl)}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 group-hover:text-blue-700"
          >
            {publication.title}
          </a>
        ) : (
          publication.title
        )}
      </h3>

      <p
        className="mt-3 h-5 truncate text-sm text-slate-600"
        title={publication.authors.join(', ')}
      >
        {publication.authors.join(', ')}
      </p>

      <div className="mt-auto flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p
          className="truncate text-xs text-slate-500"
          title={publication.sourceLabels.join(', ')}
        >
          {publication.sourceLabels.join(', ')}
        </p>
        {separateOpenAccessUrl && (
          <a
            href={separateOpenAccessUrl}
            {...getExternalLinkProps(separateOpenAccessUrl)}
            className="shrink-0 rounded-sm text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Open access
          </a>
        )}
      </div>
    </article>
  );
};

const HomePublicationsSection = () => {
  const curatedQuery = usePublications({
    category: 'research',
    page: 1,
    page_size: PAGE_SIZE,
  });
  const liveQuery = useLivePublications(
    { page: 1, page_size: PAGE_SIZE },
    { enabled: true },
  );

  const publications = useMemo(
    () =>
      selectHomepagePublications(
        mergePublicationLists(
          curatedQuery.data?.results || [],
          liveQuery.data?.results || [],
        ),
        HOMEPAGE_PUBLICATION_LIMIT,
      ),
    [curatedQuery.data?.results, liveQuery.data?.results],
  );

  const isLoading =
    publications.length === 0 &&
    (curatedQuery.isLoading || liveQuery.isLoading);

  return (
    <section
      aria-labelledby="home-publications-heading"
      aria-busy={isLoading}
      className="w-full border-t border-slate-200 bg-[#F7FAFF] px-4 py-10 md:py-12"
    >
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              Latest research
            </p>
            <h2
              id="home-publications-heading"
              className="text-2xl font-bold text-slate-900 md:text-3xl"
            >
              Research &amp; publications
            </h2>
            <p className="max-w-xl text-sm text-slate-600 md:text-base">
              Recent work from AirQo and our research collaborators.
            </p>
          </div>

          <Link
            href="/resources?tab=research"
            className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Browse all publications <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            role="status"
            aria-label="Loading publications"
          >
            {Array.from({ length: HOMEPAGE_PUBLICATION_LIMIT }, (_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-5 h-4 w-2/3 rounded bg-slate-200" />
                <div className="mb-2 h-5 w-full rounded bg-slate-200" />
                <div className="mb-5 h-5 w-4/5 rounded bg-slate-200" />
                <div className="mt-20 h-4 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : publications.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {publications.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-600"
          >
            No recent publications are available right now. Browse all
            publications for the complete collection.
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePublicationsSection;
