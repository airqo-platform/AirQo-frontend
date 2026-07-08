'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { NoData, Pagination } from '@/components/ui';
import mainConfig from '@/config/site.config';
import { useBlogs } from '@/hooks/useApiHooks';
import type { BlogPost } from '@/types/api';

import {
  BLOG_ORDER_OPTIONS,
  formatBlogDate,
  getBlogIdentifier,
  normalizeBlogImageUrl,
} from './blogUtils';

const PAGE_SIZE = 9;

const BlogCardSkeleton = () => (
  <div className="animate-pulse py-8">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="h-3 w-16 bg-gray-200 rounded" />
      <div className="h-3 w-12 bg-gray-100 rounded" />
    </div>
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="space-y-2 mb-3">
          <div className="h-6 w-full bg-gray-200 rounded" />
          <div className="h-6 w-4/5 bg-gray-200 rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="w-[180px] h-[120px] bg-gray-100 rounded-lg shrink-0" />
    </div>
  </div>
);

const BlogCard = ({ blog }: { blog: BlogPost }) => {
  const slug = getBlogIdentifier(blog);
  const detailHref = `/blogs/${encodeURIComponent(slug)}`;
  const coverImage = normalizeBlogImageUrl(blog.cover_image_url);
  const authorImage = normalizeBlogImageUrl(blog.author_image_url);

  return (
    <article className="py-8">
      <div className="flex items-center gap-2.5 mb-4">
        {authorImage ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
            <Image
              src={authorImage}
              alt={blog.author_name}
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[12px] font-semibold text-white shrink-0">
            AQ
          </div>
        )}
        <span className="text-[14px] font-medium text-[#111827]">
          {blog.author_name || 'AirQo Blogs'}
        </span>
        <span className="text-[14px] text-[#9ca3af]">
          · {formatBlogDate(blog.published_at)}
        </span>
      </div>

      <div className="flex gap-6">
        <Link href={detailHref} className="flex-1 min-w-0 group">
          <h3 className="text-[22px] font-bold leading-[1.3] tracking-[-0.01em] text-[#111827] mb-2 group-hover:text-blue-600 transition-colors line-clamp-3">
            {blog.title}
          </h3>
          <p className="text-[15px] leading-[1.6] text-[#6b7280] line-clamp-2">
            {blog.summary}
          </p>
        </Link>

        <Link
          href={detailHref}
          className="shrink-0 w-[180px] h-[120px] relative overflow-hidden rounded-lg bg-gray-100 hidden sm:block"
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={blog.title}
              fill
              sizes="180px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="text-blue-400 text-[11px] font-medium">
                No image
              </span>
            </div>
          )}
        </Link>
      </div>
    </article>
  );
};

const BlogsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordering, setOrdering] = useState('-published_at');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: PAGE_SIZE,
      category: 'airqo',
      search: searchTerm || undefined,
      ordering,
    }),
    [currentPage, ordering, searchTerm],
  );

  const { data, error, isLoading, isFetching, refetch } = useBlogs(queryParams);

  const blogs = data?.results ?? [];
  const hasActiveFilters = Boolean(searchTerm) || ordering !== '-published_at';
  const isInitialLoading = isLoading && blogs.length === 0;
  const isEmpty = !isInitialLoading && !error && blogs.length === 0;

  const resetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setOrdering('-published_at');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-[#FAFBFC]">
        <div className={`${mainConfig.containerClass} py-12 lg:py-16`}>
          <h1 className="text-[40px] font-semibold tracking-[-0.02em] text-[#111827] leading-[1.15]">
            Blog
          </h1>
          <p className="mt-2 text-[17px] leading-[1.5] text-[#6b7280] max-w-[520px]">
            Stories, updates, and insights from AirQo&apos;s work across African
            cities.
          </p>
        </div>
      </section>

      <div className={`${mainConfig.containerClass} py-4`}>
        <div className="max-w-[800px] mx-auto flex items-center gap-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 h-10 px-4 text-[14px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-colors"
          />
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-[14px] border border-gray-200 rounded-lg bg-white text-[#374151] focus:outline-none focus:border-blue-600"
          >
            {BLOG_ORDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 px-3 text-[13px] font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className={`${mainConfig.containerClass} py-4`}>
        <div className="max-w-[800px] mx-auto flex items-center justify-between rounded-lg border border-gray-200 bg-[#F9FAFB] px-5 py-3.5">
          <span className="text-[14px] text-[#374151]">
            Looking for older posts? Browse the{' '}
            <span className="font-medium">AirQo blog archive</span>
          </span>
          <a
            href="https://blog.airqo.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 ml-4 h-9 inline-flex items-center gap-2 px-4 text-[13px] font-medium bg-blue-600 text-white rounded-none hover:bg-blue-700 transition-colors"
          >
            View archive
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>

      <div className={`${mainConfig.containerClass} py-4`}>
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#111827]">
              AirQo blogs
            </h2>
            <span className="text-[13px] text-[#9ca3af]">
              {isFetching && !isInitialLoading
                ? 'Updating…'
                : `${blogs.length} article${blogs.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>

      <div className={`${mainConfig.containerClass} pb-16`}>
        <div className="max-w-[800px] mx-auto">
          {isInitialLoading ? (
            <div className="divide-y divide-gray-200">
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </div>
          ) : error && blogs.length === 0 ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center">
              <NoData
                className="p-0"
                message="We could not load the latest blog posts right now. Please try again later."
              />
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="h-9 px-4 text-[13px] font-medium bg-[#111827] text-white rounded-lg hover:bg-[#1f2937] transition-colors"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-9 px-4 text-[13px] font-medium border border-gray-200 text-[#374151] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <NoData
                className="p-0"
                message={
                  hasActiveFilters
                    ? 'No blog posts match the current filters. Try another category or search term.'
                    : 'We are publishing the latest AirQo blog stories here soon. Check back shortly for new posts.'
                }
              />
              {hasActiveFilters && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-9 px-4 text-[13px] font-medium bg-[#111827] text-white rounded-lg hover:bg-[#1f2937] transition-colors"
                  >
                    Reset filters
                  </button>
                  <Link
                    href="/contact"
                    className="h-9 px-4 inline-flex items-center text-[13px] font-medium border border-gray-200 text-[#374151] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Contact AirQo
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.public_identifier || blog.id}
                    blog={blog}
                  />
                ))}
              </div>

              {!error && data && data.total_pages > 1 && blogs.length > 0 && (
                <div className="mt-10">
                  <Pagination
                    totalPages={data.total_pages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    scrollToTop={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
