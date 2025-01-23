'use client';

import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import {
  CustomButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NoData,
  Pagination,
} from '@/components/ui';
import { useCleanAirResources } from '@/hooks/useApiHooks';

const ResourcePage = () => {
  const { cleanAirResources, isLoading, isError } = useCleanAirResources();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  // Categories for the dropdown filter
  const categories = [
    'All',
    'Toolkits',
    'Technical Reports',
    'Workshop Reports',
    'Research Publications',
  ];

  // Map and filter resources based on the selected category
  const filteredResources = useMemo(() => {
    if (selectedCategory === 'All') return cleanAirResources || [];

    const categoryMap: { [key: string]: string } = {
      Toolkits: 'toolkit',
      'Technical Reports': 'technical_report',
      'Workshop Reports': 'workshop_report',
      'Research Publications': 'research_publication',
    };

    return (
      cleanAirResources?.filter(
        (resource: any) =>
          resource.resource_category === categoryMap[selectedCategory],
      ) || []
    );
  }, [cleanAirResources, selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = useMemo(
    () =>
      filteredResources.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filteredResources, currentPage, itemsPerPage],
  );

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-5 lg:p-8 animate-pulse"
        >
          <div className="h-5 bg-blue-500 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-8 space-y-16">
      {/* Main banner section */}
      <section className="max-w-5xl mx-auto w-full">
        <div className="py-8 px-4 lg:px-0 flex flex-col items-center space-y-6 md:space-y-8">
          <div className="w-full">
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/resource_apztbz.webp"
              alt="Air Quality Management Banner"
              width={800}
              height={400}
              className="rounded-lg object-contain w-full"
            />
          </div>
        </div>
      </section>

      {/* Resource Filter and List */}
      <section className="px-4 bg-blue-50 lg:px-0 py-16">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4 md:mb-0">
              Resource Center
            </h2>
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 bg-gray-200 rounded-lg focus:outline-none">
                  {selectedCategory}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Loading and Error States */}
          {isLoading && <LoadingSkeleton />}
          {isError && (
            <NoData message="Failed to load resources. Please try again later." />
          )}

          {/* Resource Cards */}
          {!isLoading && !isError && paginatedResources.length === 0 && (
            <NoData />
          )}

          {!isLoading && !isError && paginatedResources.length > 0 && (
            <div className="space-y-6">
              {paginatedResources.map((resource: any, index: any) => (
                <div
                  key={`${resource.resource_title}-${index}`}
                  className="bg-white rounded-lg p-5 lg:p-8 shadow"
                >
                  <p className="text-blue-500 text-lg font-semibold mb-2">
                    {resource.resource_category.toUpperCase()}
                  </p>
                  <h3 className="text-2xl lg:text-4xl font-semibold mb-2">
                    {resource.resource_title}
                  </h3>
                  <div className="mb-4">
                    <p className="font-semibold text-lg">Created by</p>
                    <p>{resource.resource_authors}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {/* Read Action Plan Button */}
                    {resource.resource_link && (
                      <CustomButton
                        className="text-black bg-transparent border border-gray-800 hover:bg-gray-100"
                        onClick={() =>
                          window.open(
                            resource.resource_link,
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        Read action plan →
                      </CustomButton>
                    )}

                    {/* Download Button */}
                    {resource.resource_file && (
                      <CustomButton
                        className="text-white bg-blue-500 border border-blue-500 hover:bg-blue-600"
                        onClick={() =>
                          window.open(
                            resource.resource_file,
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        Download
                      </CustomButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading &&
            !isError &&
            filteredResources.length > itemsPerPage && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
        </div>
      </section>
    </div>
  );
};

export default ResourcePage;
