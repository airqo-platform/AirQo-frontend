'use client';

import Image from 'next/image';
import type React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NoData,
  Pagination,
} from '@/components/ui';
import { useCleanAirResources } from '@/hooks/useApiHooks';
import { useResourceFilter } from '@/hooks/useResourceFilter';
import type { Resource } from '@/types/index';

import ResourceCard from './ResourceCard';

const categories = [
  'All',
  'Toolkit',
  'Technical Report',
  'Workshop Report',
  'Research Publication',
];

const LoadingSkeleton = ({ itemsPerPage }: { itemsPerPage: number }) => (
  <div className="space-y-6">
    {Array.from({ length: itemsPerPage }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-5 lg:p-8 animate-pulse">
        <div className="h-5 bg-blue-500 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
    ))}
  </div>
);

const ResourcePage: React.FC = () => {
  const { cleanAirResources, isLoading, isError } = useCleanAirResources();
  const itemsPerPage = 3;

  const {
    selectedCategory,
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    paginatedResources,
    totalPages,
  } = useResourceFilter(cleanAirResources || [], itemsPerPage);

  return (
    <div className="py-8 space-y-16">
      <section className="max-w-5xl mx-auto w-full">
        <div className="py-8 px-4 lg:px-0 flex flex-col items-center space-y-6 md:space-y-8">
          <div className="w-full">
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/resource_apztbz.webp"
              alt="Air Quality Management Banner"
              width={800}
              height={400}
              className="rounded-lg object-contain w-full"
              priority
            />
          </div>
        </div>
      </section>

      <section className="px-4 bg-blue-50 lg:px-0 py-16">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4 md:mb-0">
              Resource Center
            </h2>
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

          {isLoading && <LoadingSkeleton itemsPerPage={itemsPerPage} />}
          {isError && (
            <NoData message="Failed to load resources. Please try again later." />
          )}

          {!isLoading && !isError && paginatedResources.length === 0 && (
            <NoData />
          )}

          {!isLoading && !isError && paginatedResources.length > 0 && (
            <div className="space-y-6">
              {paginatedResources.map((resource: Resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              scrollToTop={true}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default ResourcePage;
