'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { FiDownload, FiExternalLink } from 'react-icons/fi';

import { NoData, Pagination } from '@/components/ui';
import mainConfig from '@/config/site.config';
import { useLivePublications, usePublications } from '@/hooks/useApiHooks';
import { getExternalLinkProps } from '@/lib/security/safeExternalLink';
import type {
  CuratedPublication,
  PublicationFeedItem,
} from '@/lib/utils/publications';
import { mergePublicationLists } from '@/lib/utils/publications';
import type { LivePublication } from '@/types/publications-feed';

type ResourceItem = {
  title?: string;
  resource_title?: string;
  authors?: string | string[];
  resource_authors?: string | string[];
  description?: string;
  link?: string;
  link_title?: string;
  resource_file_url?: string;
};

const formatPublicationDate = (date?: string, year?: number) => {
  if (!date) return year ? String(year) : undefined;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime()))
    return year ? String(year) : undefined;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
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

const ResearchPublicationCard: React.FC<{
  publication: PublicationFeedItem;
}> = ({ publication }) => {
  const publicationDate = formatPublicationDate(
    publication.publishedDate,
    publication.year,
  );
  const publicationUrl = getHttpsUrl(publication.url);
  const openAccessUrl = getHttpsUrl(publication.openAccessUrl);

  return (
    <article className="rounded-lg bg-card-custom-gradient p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:p-12">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
        {publicationDate && <span>{publicationDate}</span>}
        {publication.journal && <span>{publication.journal}</span>}
      </div>

      <h2 className="mb-3 line-clamp-3 text-xl font-semibold">
        {publication.title}
      </h2>

      {publication.authors.length > 0 && (
        <p className="mb-4 line-clamp-2 text-gray-600">
          {publication.authors.join(', ')}
        </p>
      )}

      {(publication.abstract || publication.description) && (
        <p className="mb-6 line-clamp-4 leading-relaxed text-gray-700">
          {publication.abstract || publication.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {publicationUrl && (
          <a
            className="flex items-center border border-black bg-transparent px-4 py-2 text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            href={publicationUrl}
            {...getExternalLinkProps(publicationUrl)}
          >
            View publication <FiExternalLink className="ml-2" />
          </a>
        )}

        {openAccessUrl && openAccessUrl !== publicationUrl && (
          <a
            className="flex items-center border border-black bg-transparent px-4 py-2 text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            href={openAccessUrl}
            {...getExternalLinkProps(openAccessUrl)}
          >
            <FiDownload className="mr-2" /> Open access copy
          </a>
        )}
      </div>
    </article>
  );
};

const ResourcePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = useMemo(
    () => [
      { name: 'Policy Documents', value: 'policy' },
      { name: 'Technical Reports', value: 'technical' },
      { name: 'Research Publications', value: 'research' },
      { name: 'Guides and Manuals', value: ['guide', 'manual'] },
    ],
    [],
  );

  const initialTabParam = searchParams?.get('tab') || 'policy';
  const initialSelected = initialTabParam.includes(',')
    ? initialTabParam
        .split(',')
        .map((tab) => tab.trim())
        .filter(Boolean)
    : initialTabParam;
  const [selectedTab, setSelectedTab] = useState<string | string[]>(
    initialSelected,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  const isCombinedCategory =
    Array.isArray(selectedTab) &&
    selectedTab.includes('guide') &&
    selectedTab.includes('manual');
  const isResearchCategory = selectedTab === 'research';

  const guidePage1 = usePublications(
    isCombinedCategory
      ? { category: 'guide', page_size: 4, page: 1 }
      : undefined,
  );
  const guidePage2 = usePublications(
    isCombinedCategory
      ? { category: 'guide', page_size: 4, page: 2 }
      : undefined,
  );
  const guidePage3 = usePublications(
    isCombinedCategory
      ? { category: 'guide', page_size: 4, page: 3 }
      : undefined,
  );
  const manualPage1 = usePublications(
    isCombinedCategory
      ? { category: 'manual', page_size: 4, page: 1 }
      : undefined,
  );
  const manualPage2 = usePublications(
    isCombinedCategory
      ? { category: 'manual', page_size: 4, page: 2 }
      : undefined,
  );
  const manualPage3 = usePublications(
    isCombinedCategory
      ? { category: 'manual', page_size: 4, page: 3 }
      : undefined,
  );
  const singleCategoryData = usePublications(
    !isCombinedCategory
      ? {
          page: currentPage,
          page_size: 4,
          category: selectedTab as string,
        }
      : undefined,
  );
  const livePublicationsData = useLivePublications(
    isResearchCategory
      ? { page: currentPage, page_size: itemsPerPage }
      : undefined,
    { enabled: isResearchCategory },
  );

  const { results, totalPages, error, isLoading } = useMemo(() => {
    if (isResearchCategory) {
      const curatedResults = (singleCategoryData.data?.results ||
        []) as CuratedPublication[];
      const liveResults = (livePublicationsData.data?.results ||
        []) as LivePublication[];
      const researchResults = mergePublicationLists(
        curatedResults,
        liveResults,
      );
      const liveRequestIsLoading =
        livePublicationsData.isLoading ||
        (livePublicationsData.isFetching && !livePublicationsData.data);
      const fallbackTotalPages = singleCategoryData.data?.total_pages || 1;
      const liveTotalPages = livePublicationsData.data?.totalPages || 0;

      return {
        results: researchResults,
        totalPages: Math.max(fallbackTotalPages, liveTotalPages),
        error:
          researchResults.length > 0
            ? null
            : singleCategoryData.error || livePublicationsData.error,
        isLoading:
          researchResults.length === 0 &&
          (singleCategoryData.isLoading || liveRequestIsLoading),
      };
    }

    if (isCombinedCategory) {
      const guideResults = [
        ...(guidePage1.data?.results || []),
        ...(guidePage2.data?.results || []),
        ...(guidePage3.data?.results || []),
      ];
      const manualResults = [
        ...(manualPage1.data?.results || []),
        ...(manualPage2.data?.results || []),
        ...(manualPage3.data?.results || []),
      ];
      const combinedResults = [...guideResults, ...manualResults];
      const startIndex = (currentPage - 1) * itemsPerPage;

      return {
        results: combinedResults.slice(startIndex, startIndex + itemsPerPage),
        totalPages: Math.ceil(combinedResults.length / itemsPerPage),
        error:
          guidePage1.error ||
          guidePage2.error ||
          guidePage3.error ||
          manualPage1.error ||
          manualPage2.error ||
          manualPage3.error,
        isLoading:
          guidePage1.isLoading ||
          guidePage2.isLoading ||
          guidePage3.isLoading ||
          manualPage1.isLoading ||
          manualPage2.isLoading ||
          manualPage3.isLoading,
      };
    }

    return {
      results: singleCategoryData.data?.results || [],
      totalPages: singleCategoryData.data?.total_pages || 1,
      error: singleCategoryData.error,
      isLoading: singleCategoryData.isLoading,
    };
  }, [
    currentPage,
    guidePage1.data,
    guidePage1.error,
    guidePage1.isLoading,
    guidePage2.data,
    guidePage2.error,
    guidePage2.isLoading,
    guidePage3.data,
    guidePage3.error,
    guidePage3.isLoading,
    isCombinedCategory,
    isResearchCategory,
    itemsPerPage,
    livePublicationsData.data,
    livePublicationsData.error,
    livePublicationsData.isFetching,
    livePublicationsData.isLoading,
    manualPage1.data,
    manualPage1.error,
    manualPage1.isLoading,
    manualPage2.data,
    manualPage2.error,
    manualPage2.isLoading,
    manualPage3.data,
    manualPage3.error,
    manualPage3.isLoading,
    singleCategoryData.data,
    singleCategoryData.error,
    singleCategoryData.isLoading,
  ]);

  const handleTabClick = (tabValue: string | string[]) => {
    setSelectedTab(tabValue);
    setCurrentPage(1);
    router.push(
      `/resources?tab=${Array.isArray(tabValue) ? tabValue.join(',') : tabValue}`,
    );
  };

  return (
    <div className="flex w-full flex-col space-y-16 overflow-hidden">
      <section className="bg-[#F2F1F6] pt-16">
        <div className={`${mainConfig.containerClass} px-4`}>
          <h1 className="mb-4 text-4xl font-bold">Resources</h1>
          <p className="mb-8 text-xl">
            Discover our latest collection of resources
          </p>

          <div className="flex space-x-8 overflow-x-auto border-b border-gray-300">
            {tabs.map((tab) => {
              const selectedTabArray = Array.isArray(selectedTab)
                ? selectedTab
                : selectedTab.split(',').map((value) => value.trim());
              const isSelected = Array.isArray(tab.value)
                ? tab.value.every((value) => selectedTabArray.includes(value))
                : selectedTabArray.includes(tab.value);

              return (
                <button
                  key={typeof tab.value === 'string' ? tab.value : tab.name}
                  type="button"
                  onClick={() => handleTabClick(tab.value)}
                  aria-pressed={isSelected}
                  className={`pb-2 text-lg transition-colors duration-300 ${
                    isSelected
                      ? 'border-b-2 border-black font-semibold text-black'
                      : 'text-gray-500 hover:text-gray-900'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${mainConfig.containerClass} w-full px-4`}>
        {isLoading ? (
          <div
            className="space-y-6"
            role="status"
            aria-live="polite"
            aria-label={
              isResearchCategory
                ? 'Loading research publications'
                : 'Loading resources'
            }
          >
            <p className="text-sm text-gray-600">
              {isResearchCategory
                ? 'Loading research publications...'
                : 'Loading resources...'}
            </p>
            {[...Array(itemsPerPage)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-lg bg-gray-100 p-6 lg:p-16"
              >
                <div className="mb-4 h-6 w-3/4 rounded bg-gray-300" />
                <div className="mb-4 h-4 w-1/2 rounded bg-gray-300" />
                <div className="mb-6 h-16 w-full rounded bg-gray-200" />
                <div className="flex flex-wrap gap-4">
                  <div className="h-10 w-32 rounded bg-gray-300" />
                  <div className="h-10 w-32 rounded bg-gray-300" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <NoData message="Failed to load resources. Please try again later." />
        ) : isResearchCategory ? (
          results.length === 0 ? (
            <NoData message="No publications were found. Please try again later." />
          ) : (
            <div className="space-y-6">
              {(results as PublicationFeedItem[]).map((publication) => (
                <ResearchPublicationCard
                  key={publication.id}
                  publication={publication}
                />
              ))}
            </div>
          )
        ) : results.length === 0 ? (
          <NoData message="No resources available for this category." />
        ) : (
          <div className="space-y-6">
            {results.map((resource: ResourceItem, index: number) => {
              const resourceAuthors =
                resource.authors || resource.resource_authors;
              const resourceLink = getHttpsUrl(resource.link);
              const resourceFileUrl = getHttpsUrl(resource.resource_file_url);

              return (
                <article
                  key={index}
                  className="rounded-lg bg-card-custom-gradient p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:p-16"
                >
                  <h2 className="mb-2 text-xl font-semibold">
                    {resource.title || resource.resource_title}
                  </h2>
                  <p className="mb-4 text-gray-600">
                    {Array.isArray(resourceAuthors)
                      ? resourceAuthors.join(', ')
                      : resourceAuthors}
                  </p>
                  {resource.description && (
                    <p className="mb-6 leading-relaxed text-gray-700">
                      {resource.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4">
                    {resourceLink && (
                      <a
                        className="flex items-center border border-black bg-transparent px-4 py-2 text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        href={resourceLink}
                        {...getExternalLinkProps(resourceLink)}
                      >
                        {resource.link_title || 'Read More'}{' '}
                        <FiExternalLink className="ml-2" />
                      </a>
                    )}
                    {resourceFileUrl && (
                      <a
                        className="flex items-center border border-black bg-transparent px-4 py-2 text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        href={resourceFileUrl}
                        {...getExternalLinkProps(resourceFileUrl)}
                      >
                        <FiDownload className="mr-2" /> Download
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {results.length > 0 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          scrollToTop={true}
        />
      )}
    </div>
  );
};

export default ResourcePage;
