'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import { CustomButton, NoData, Pagination } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { usePublications } from '@/hooks/useApiHooks';

const ResourcePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tabs mapped to categories from the Publication model
  const tabs = useMemo(
    () => [
      { name: 'Policy Documents', value: 'policy' },
      { name: 'Technical Reports', value: 'technical' },
      { name: 'Research Publications', value: 'research' },
      { name: 'Guides and Manuals', value: ['guide', 'manual'] }, // Guides and Manuals combined
    ],
    [],
  );

  // State management
  const initialTabParam = (searchParams?.get('tab') as string) || 'policy';
  const initialSelected = initialTabParam.includes(',')
    ? initialTabParam
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : initialTabParam;
  const [selectedTab, setSelectedTab] = useState<string | string[]>(
    initialSelected,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination logic
  const itemsPerPage = 4;

  // Check if this is a combined category (guide + manual)
  const isCombinedCategory =
    Array.isArray(selectedTab) &&
    selectedTab.includes('guide') &&
    selectedTab.includes('manual');

  // For combined categories, fetch guide and manual separately with page_size: 4
  // We need to fetch all pages for client-side pagination
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

  // For single categories, use traditional pagination with page_size: 4
  const singleCategoryData = usePublications(
    !isCombinedCategory
      ? {
          page: currentPage,
          page_size: 4,
          category: selectedTab as string,
        }
      : undefined,
  );

  // Process data based on category type
  const { results, totalPages, error, isLoading } = useMemo(() => {
    if (isCombinedCategory) {
      // Combine guide and manual data from all pages
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

      // Client-side pagination for combined results
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = combinedResults.slice(startIndex, endIndex);
      const calculatedTotalPages = Math.ceil(
        combinedResults.length / itemsPerPage,
      );

      return {
        results: paginatedResults,
        totalPages: calculatedTotalPages,
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
    } else {
      // Single category with server-side pagination
      return {
        results: singleCategoryData.data?.results || [],
        totalPages: singleCategoryData.data?.total_pages || 1,
        error: singleCategoryData.error,
        isLoading: singleCategoryData.isLoading,
      };
    }
  }, [
    isCombinedCategory,
    guidePage1.data,
    guidePage1.error,
    guidePage1.isLoading,
    guidePage2.data,
    guidePage2.error,
    guidePage2.isLoading,
    guidePage3.data,
    guidePage3.error,
    guidePage3.isLoading,
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
    currentPage,
    itemsPerPage,
  ]);

  // Handle tab click
  const handleTabClick = (tabValue: string | string[]) => {
    setSelectedTab(tabValue);
    setCurrentPage(1);
    const url = `/resources?tab=${Array.isArray(tabValue) ? tabValue.join(',') : tabValue}`;
    router.push(url);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col w-full space-y-16 overflow-hidden">
      {/* Header Section */}
      <section className="bg-[#F2F1F6] pt-16">
        <div className={`${mainConfig.containerClass} px-4`}>
          <h1 className="text-4xl font-bold mb-4">Resources</h1>
          <p className="text-xl mb-8">
            Discover our latest collection of resources
          </p>

          {/* Tabs Section */}
          <div className="flex space-x-8 border-b overflow-x-auto border-gray-300">
            {tabs.map((tab) => (
              <button
                key={typeof tab.value === 'string' ? tab.value : tab.name}
                onClick={() => handleTabClick(tab.value)}
                className={`pb-2 text-lg ${
                  (() => {
                    // Normalize selectedTab to array for comparison
                    const selectedTabArray = Array.isArray(selectedTab)
                      ? selectedTab
                      : typeof selectedTab === 'string'
                        ? selectedTab.split(',').map((t) => t.trim())
                        : [];

                    if (Array.isArray(tab.value)) {
                      // For combined tabs like ['guide', 'manual']
                      return tab.value.every((v) =>
                        selectedTabArray.includes(v),
                      );
                    } else {
                      // For single value tabs
                      return (
                        selectedTab === tab.value ||
                        selectedTabArray.includes(tab.value)
                      );
                    }
                  })()
                    ? 'text-black border-b-2 border-black font-semibold'
                    : 'text-gray-500'
                } transition-colors duration-300`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources List Section */}
      <section className={`${mainConfig.containerClass} w-full px-4`}>
        {isLoading ? (
          // Skeleton Loader
          <div className="space-y-6">
            {[...Array(itemsPerPage)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-100 p-6 lg:p-16 rounded-lg animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded w-full mb-6"></div>
                <div className="flex flex-wrap gap-4">
                  <div className="h-10 bg-gray-300 rounded w-32"></div>
                  <div className="h-10 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <NoData message="Failed to load resources. Please try again later." />
        ) : results.length === 0 ? (
          <NoData message="No resources available for this category." />
        ) : (
          <div className="space-y-6">
            {results.map((resource: any, idx: any) => (
              <div
                key={idx}
                className="bg-card-custom-gradient p-6 lg:p-16 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {resource.title || resource.resource_title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {resource.authors || resource.resource_authors}
                </p>
                {resource.description && (
                  <div className="text-gray-700 mb-6 leading-relaxed">
                    <p>{resource.description}</p>
                  </div>
                )}
                <div className="flex items-center flex-wrap gap-4">
                  {resource.link && (
                    <CustomButton
                      className="flex items-center text-black border border-black bg-transparent px-4 py-2 hover:bg-black hover:text-white transition-colors"
                      onClick={() => window.open(resource.link, '_blank')}
                    >
                      {resource.link_title || 'Read More'} →
                    </CustomButton>
                  )}

                  {resource.resource_file_url && (
                    <CustomButton
                      className="flex items-center text-black border border-black bg-transparent px-4 py-2 hover:bg-black hover:text-white transition-colors"
                      onClick={() =>
                        window.open(resource.resource_file_url, '_blank')
                      }
                    >
                      <FiDownload className="mr-2" /> Download
                    </CustomButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pagination Section */}
      {results.length > 0 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          scrollToTop={true}
        />
      )}
    </div>
  );
};

export default ResourcePage;
