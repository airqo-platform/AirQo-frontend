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
  getBlogCategoryLabel,
  getBlogIdentifier,
  normalizeBlogImageUrl,
} from './blogUtils';

const PAGE_SIZE = 9;

const BlogCardSkeleton = () => (
  <div className="animate-pulse bg-white border border-[#f0f0f0] rounded-[10px] overflow-hidden">
    <div className="aspect-[16/10] bg-gray-100" />
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2 mb-2">
        <div className="h-5 w-11/12 bg-gray-200 rounded" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="space-y-1.5 mt-3">
        <div className="h-3.5 w-full bg-gray-100 rounded" />
        <div className="h-3.5 w-5/6 bg-gray-100 rounded" />
      </div>
      <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-[#f0f0f0]">
        <div className="w-7 h-7 rounded-full bg-gray-200" />
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const BlogCard = ({ blog }: { blog: BlogPost }) => {
  const slug = getBlogIdentifier(blog);
  const detailHref = `/blogs/${encodeURIComponent(slug)}`;
  const coverImage = normalizeBlogImageUrl(blog.cover_image_url);

  return (
    <article className="group bg-white border border-[#f0f0f0] rounded-[10px] overflow-hidden transition-colors hover:border-[#d1d5db]">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#f9fafb]">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-end p-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9ca3af]">
                {getBlogCategoryLabel(blog.website_category)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-blue-600">
            {getBlogCategoryLabel(blog.website_category)}
          </span>
          <span className="text-[11px] text-[#d1d5db]">&middot;</span>
          <span className="text-[12px] text-[#9ca3af]">
            {formatBlogDate(blog.published_at)}
          </span>
        </div>

        <Link href={detailHref}>
          <h3 className="text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#111827] mb-2 group-hover:text-blue-600 transition-colors">
            {blog.title}
          </h3>
        </Link>

        <p className="text-[14px] leading-[1.55] text-[#6b7280] line-clamp-2 mb-4">
          {blog.summary}
        </p>

        <div className="flex items-center gap-2.5 pt-3 border-t border-[#f0f0f0]">
          {blog.author_image_url ? (
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
              <Image
                src={normalizeBlogImageUrl(blog.author_image_url)}
                alt={blog.author_name}
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[11px] font-medium text-[#6b7280] shrink-0">
              {blog.author_name?.charAt(0) || 'A'}
            </div>
          )}
          <span className="text-[13px] text-[#374151] font-medium">
            {blog.author_name || 'AirQo Team'}
          </span>
        </div>
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
        <div className="flex items-center gap-4">
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

      <div className={`${mainConfig.containerClass} pb-16`}>
        {isInitialLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog.public_identifier || blog.id} blog={blog} />
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
  );
};

export default BlogsPage;
