'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import { CustomButton, NoData, Pagination } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { usePublications } from '@/services/hooks/endpoints';

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
  const [selectedTab, setSelectedTab] = useState<string | string[]>(
    (searchParams?.get('tab') as string) || 'policy',
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination logic
  const itemsPerPage = 4;

  // Build category param
  const categoryParam = Array.isArray(selectedTab)
    ? selectedTab.join(',')
    : (selectedTab as string);

  // Fetch paginated publications from the v2 endpoint
  const {
    data: publicationsPage,
    error,
    isLoading,
  } = usePublications({
    page: currentPage,
    page_size: itemsPerPage,
    category: categoryParam,
  } as any);

  const results = publicationsPage?.results ?? [];
  const totalPages = publicationsPage?.total_pages ?? 1;

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
                  (Array.isArray(selectedTab) &&
                    selectedTab.includes('guide') &&
                    selectedTab.includes('manual') &&
                    (Array.isArray(tab.value)
                      ? tab.value.includes('guide') &&
                        tab.value.includes('manual')
                      : false)) ||
                  selectedTab === tab.value
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
