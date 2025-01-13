'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import React, { useState } from 'react';

import { CustomButton, NoData, Pagination } from '@/components/ui';
import { usePressArticles } from '@/hooks/useApiHooks';

const PressPage: React.FC = () => {
  const { pressArticles, isLoading, isError } = usePressArticles();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(pressArticles.length / itemsPerPage);
  const displayedArticles = pressArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  // Skeleton Loader component
  const ArticleSkeleton = () => (
    <div className="p-8 lg:px-16 lg:py-12 space-y-8 rounded-lg shadow-sm bg-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-32 h-8 bg-gray-300 rounded-md"></div>
        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
      </div>
      <div className="w-full h-6 bg-gray-300 rounded-md"></div>
      <div className="w-1/2 h-6 bg-gray-300 rounded-md"></div>
      <div className="w-24 h-10 bg-gray-300 rounded-md mt-4"></div>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Section */}
      <section className="mb-12 bg-[#F2F1F6] px-4 lg:px-0 py-16">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-4xl font-bold mb-2">In the Press</h1>
          <p className="text-lg text-gray-600">
            Stories about AirQo that we think you&apos;ll love
          </p>
        </div>
      </section>

      {/* Articles Section */}
      <section>
        {isLoading ? (
          // Display 4 skeletons when loading
          <div className="max-w-5xl mx-auto w-full px-4 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ArticleSkeleton />
            <ArticleSkeleton />
            <ArticleSkeleton />
            <ArticleSkeleton />
          </div>
        ) : isError ? (
          <NoData message="Failed to load articles. Please try again later." />
        ) : displayedArticles.length > 0 ? (
          <div className="max-w-5xl mx-auto w-full px-4 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {displayedArticles.map((article: any) => (
              <div
                key={article.id}
                className={`p-8 lg:px-16 lg:py-12 space-y-6 rounded-lg shadow-sm transition-shadow hover:shadow-md bg-card-custom-gradient`}
              >
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <div className="absolute inset-0 bg-card-custom-gradient opacity-70 pointer-events-none"></div>
                    <Image
                      src={article.publisher_logo_url || '/default-logo.png'}
                      alt="logo"
                      width={100}
                      height={30}
                      className="object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {formatDate(article.date_published)}
                  </p>
                </div>
                <h2 className="text-2xl font-semibold">
                  {article.article_title}
                </h2>
                <p className="text-sm">{article.article_intro}</p>
                <CustomButton
                  onClick={() => window.open(article.article_link, '_blank')}
                  className="text-black px-4 py-2 bg-transparent border border-black transition-colors mt-4"
                >
                  Read article →
                </CustomButton>
              </div>
            ))}
          </div>
        ) : (
          <NoData />
        )}
      </section>

      {/* Pagination Section */}
      {pressArticles.length > itemsPerPage && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PressPage;
