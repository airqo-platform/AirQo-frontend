'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { CustomButton, NoData, Pagination } from '@/components/ui';
import mainConfig from '@/config/site.config';
import { usePressArticles } from '@/hooks/useApiHooks';

const PressPage: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const { data, error, isLoading } = usePressArticles({
    page: currentPage,
    page_size: 6,
  });

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

  const articles = data?.results ?? [];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Section */}
      <section className="mb-12 bg-[#F2F1F6] px-4 sm:px-6 lg:px-8 py-16">
        <div className={`${mainConfig.containerClass} w-full`}>
          <h1 className="text-4xl font-bold mb-2">In the Press</h1>
          <p className="text-lg text-gray-600">
            Stories about AirQo that we think you&apos;ll love
          </p>
        </div>
      </section>

      {/* Articles Section */}
      <section className={`${mainConfig.containerClass}`}>
        {isLoading ? (
          // Display skeletons when loading
          <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ArticleSkeleton />
            <ArticleSkeleton />
            <ArticleSkeleton />
            <ArticleSkeleton />
          </div>
        ) : error ? (
          <NoData message="Failed to load articles. Please try again later." />
        ) : articles.length > 0 ? (
          <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {articles.map((article: any) => {
              const articleLink = article.article_link
                ? article.article_link
                : article.has_slug
                  ? `/press/${article.public_identifier}`
                  : article.api_url;

              return (
                <div
                  key={article.public_identifier || article.api_url}
                  className={`p-8 lg:px-16 lg:py-12 space-y-6 rounded-lg shadow-sm transition-shadow hover:shadow-md bg-card-custom-gradient`}
                >
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <div className="absolute inset-0 bg-card-custom-gradient opacity-70 pointer-events-none"></div>
                      <Image
                        src={article.publisher_logo_url || '/default-logo.png'}
                        alt={
                          article.website_category_display || 'publisher logo'
                        }
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
                    onClick={() =>
                      window.open(articleLink, '_blank', 'noopener,noreferrer')
                    }
                    className="text-black px-4 py-2 bg-transparent border border-black transition-colors mt-4 hover:bg-gray-100 active:bg-gray-100"
                  >
                    Read article →
                  </CustomButton>
                </div>
              );
            })}
          </div>
        ) : (
          <NoData />
        )}

        {/* Pagination */}
        {!error && data && data.total_pages > 1 && articles.length > 0 && (
          <div className="w-full px-4 sm:px-6 lg:px-8 mt-8 mb-8">
            <Pagination
              totalPages={data.total_pages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              scrollToTop={true}
            />
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="px-4 sm:px-6 pb-16 lg:px-8">
        <div
          className={`${mainConfig.containerClass} rounded-md border border-brand-100 bg-brand-50 px-6 py-10 sm:px-8 sm:py-12`}
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Media enquiry?
            </h2>
            <p className="mt-3 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
              Working on a story about air quality? The AirQo team can help with
              interviews, data and press resources.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 whitespace-normal rounded-md bg-brand px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Contact the AirQo team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressPage;
