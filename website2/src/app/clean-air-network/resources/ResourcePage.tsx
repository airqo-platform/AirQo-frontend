'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import {
  CustomButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NoData,
  Pagination,
} from '@/components/ui';
import { getCleanAirResources } from '@/services/apiService';

// Define the structure of the fetched resource
interface FetchedResource {
  id: string;
  resource_title: string;
  resource_link: string | null;
  resource_file: string;
  author_title: string;
  resource_category: string;
  resource_authors: string;
  order: number;
}

// Define the structure used in the component
interface Resource {
  category: string;
  title: string;
  createdBy: string;
  link?: string;
  file?: string;
}

const ResourcePage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 3;

  // Categories for the dropdown filter
  const categories = [
    'All',
    'Toolkits',
    'Technical Reports',
    'Workshop Reports',
    'Research Publications',
  ];

  // Function to map API data to component structure
  const mapResources = (fetchedResources: FetchedResource[]): Resource[] => {
    return fetchedResources.map((res) => {
      // Map the resource_category to match the dropdown categories
      const categoryMap: { [key: string]: string } = {
        toolkit: 'Toolkits',
        technical_report: 'Technical Reports',
        workshop_report: 'Workshop Reports',
        research_publication: 'Research Publications',
      };

      return {
        category: categoryMap[res.resource_category] || 'Others',
        title: res.resource_title,
        createdBy: res.resource_authors,
        link: res.resource_link ?? undefined, // Convert null to undefined
        file: res.resource_file || undefined, // Ensure file is undefined if empty
      };
    });
  };

  // Fetch resources from the API
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const fetchedData: FetchedResource[] = await getCleanAirResources();
        const mappedData = mapResources(fetchedData);
        setResources(mappedData);
        setFilteredResources(mappedData);
      } catch (err) {
        setError('Failed to fetch resources. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filter changes

    if (category === 'All') {
      setFilteredResources(resources);
    } else {
      setFilteredResources(
        resources.filter((resource) => resource.category === category),
      );
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Loading and Error States */}
          {loading && <LoadingSkeleton />}
          {error && <NoData message={error} />}

          {/* Resource Cards */}
          {!loading && !error && paginatedResources.length === 0 && <NoData />}

          {!loading && !error && paginatedResources.length > 0 && (
            <div className="space-y-6">
              {paginatedResources.map((resource, index) => (
                <div
                  key={`${resource.title}-${index}`}
                  className="bg-white rounded-lg p-5 lg:p-8 shadow"
                >
                  <p className="text-blue-500 text-lg font-semibold mb-2">
                    {resource.category.toUpperCase()}
                  </p>
                  <h3 className="text-2xl lg:text-4xl font-semibold mb-2">
                    {resource.title}
                  </h3>
                  <div className="mb-4">
                    <p className="font-semibold text-lg">Created by</p>
                    <p>{resource.createdBy}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {/* Read Action Plan Button */}
                    <CustomButton
                      className="text-black bg-transparent border border-gray-800 hover:bg-gray-100"
                      onClick={() =>
                        resource.link
                          ? window.open(
                              resource.link,
                              '_blank',
                              'noopener,noreferrer',
                            )
                          : window.open(
                              resource.file,
                              '_blank',
                              'noopener,noreferrer',
                            )
                      }
                    >
                      Read action plan →
                    </CustomButton>

                    {/* Download Button */}
                    {resource.file && (
                      <CustomButton
                        className="text-white bg-blue-500 border border-blue-500 hover:bg-blue-600"
                        onClick={() =>
                          window.open(
                            resource.file,
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
          {!loading && !error && filteredResources.length > itemsPerPage && (
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
