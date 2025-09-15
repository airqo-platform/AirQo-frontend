'use client';

import React, { useMemo, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

import { Accordion, Input, NoData, Pagination } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useFAQs } from '@/hooks/useApiHooks';
import { FAQ } from '@/types';

const FAQPage: React.FC = () => {
  const { data: faqs, isLoading, isError } = useFAQs();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search FAQs
  const filteredFaqs = useMemo(() => {
    const activeFaqs = faqs.filter((faq: FAQ) => faq.is_active);

    if (!searchQuery.trim()) {
      return activeFaqs;
    }

    return activeFaqs.filter(
      (faq: FAQ) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [faqs, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const displayedFaqs = filteredFaqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Simple Skeleton Loader component
  const FAQSkeleton = () => (
    <div className="border-b border-gray-300 mb-4 animate-pulse">
      <div className="flex justify-between items-center py-4">
        <div className="w-3/4 h-6 bg-gray-300 rounded-md"></div>
        <div className="w-5 h-5 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );

  const renderFAQContent = (answerHtml: string) => {
    return (
      <div
        className="prose prose-sm max-w-none text-gray-600"
        dangerouslySetInnerHTML={{ __html: answerHtml }}
      />
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Section */}
      <section className="mb-12 bg-[#F2F1F6] px-4 lg:px-0 py-16">
        <div className={`${mainConfig.containerClass} w-full`}>
          <h1 className="text-4xl font-bold mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about AirQo and our services
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`${mainConfig.containerClass} px-4 lg:px-0 mb-16`}>
        <div className="w-full">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Search Results Count */}
            {searchQuery && !isLoading && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {filteredFaqs.length === 0
                    ? 'No FAQs found matching your search'
                    : `${filteredFaqs.length} FAQ${
                        filteredFaqs.length !== 1 ? 's' : ''
                      } found`}
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="w-full">
              {[...Array(5)].map((_, index) => (
                <FAQSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <NoData message="Failed to load FAQs. Please try again later." />
          ) : filteredFaqs.length > 0 ? (
            <>
              {/* FAQ List */}
              <div className="w-full">
                {displayedFaqs.map((faq: FAQ) => (
                  <Accordion key={faq.id} title={faq.question}>
                    {renderFAQContent(faq.answer_html)}
                  </Accordion>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    scrollToTop={true}
                  />
                </div>
              )}

              {/* FAQ Count */}
              {totalPages > 1 && (
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredFaqs.length)}{' '}
                    of {filteredFaqs.length} FAQs
                  </p>
                </div>
              )}
            </>
          ) : (
            <NoData
              message={
                searchQuery
                  ? 'No FAQs match your search. Try different keywords.'
                  : 'No FAQs available at the moment.'
              }
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
