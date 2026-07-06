'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  NoData,
  Pagination,
} from '@/components/ui';
import mainConfig from '@/config/site.config';
import { useBlogs } from '@/hooks/useApiHooks';
import type { BlogPost } from '@/types/api';

import {
  BLOG_CATEGORY_OPTIONS,
  BLOG_ORDER_OPTIONS,
  formatBlogDate,
  getBlogCategoryLabel,
  getBlogIdentifier,
  normalizeBlogImageUrl,
} from './blogUtils';

const PAGE_SIZE = 6;
const LEGACY_BLOGS_URL = 'https://blog.airqo.net/';

const BlogCardSkeleton = () => (
  <Card className="overflow-hidden border-gray-200 shadow-sm animate-pulse">
    <div className="aspect-[16/9] bg-gray-200" />
    <CardHeader className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-28 bg-gray-200" />
        <div className="h-4 w-20 bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-11/12 bg-gray-200" />
        <div className="h-6 w-4/5 bg-gray-200" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3 px-6 pb-6 pt-0">
      <div className="h-4 w-full bg-gray-200" />
      <div className="h-4 w-5/6 bg-gray-200" />
      <div className="h-4 w-2/3 bg-gray-200" />
    </CardContent>
  </Card>
);

const BlogCard = ({ blog }: { blog: BlogPost }) => {
  const slug = getBlogIdentifier(blog);
  const detailHref = `/blogs/${encodeURIComponent(slug)}`;
  const coverImage = normalizeBlogImageUrl(blog.cover_image_url);
  const authorImage = normalizeBlogImageUrl(blog.author_image_url);

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm transition-shadow hover:shadow-md">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-[#F2F1F6] p-6">
              <div className="max-w-md space-y-3">
                <span className="inline-flex bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 shadow-sm">
                  {getBlogCategoryLabel(blog.website_category)}
                </span>
                <p className="text-lg font-semibold leading-7 text-gray-900">
                  {blog.title}
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
          <span>{getBlogCategoryLabel(blog.website_category)}</span>
          <span>{formatBlogDate(blog.published_at)}</span>
        </div>
        <CardTitle className="text-2xl leading-tight text-gray-900">
          <Link href={detailHref} className="hover:text-blue-700">
            {blog.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-4 text-base leading-7 text-gray-600">
          {blog.summary}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex items-center justify-between gap-5 border-t border-gray-100 px-6 pb-6 pt-5">
        <div className="flex items-center gap-3">
          {authorImage ? (
            <Image
              src={authorImage}
              alt={blog.author_name}
              width={44}
              height={44}
              className="rounded-full h-11 w-11 object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
              {blog.author_name
                ? blog.author_name
                    .split(' ')
                    .slice(0, 2)
                    .map((part: string) => part.charAt(0))
                    .join('')
                : 'AQ'}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {blog.author_name || 'AirQo Team'}
            </p>
            <p className="truncate text-xs text-gray-500">
              {blog.author_role || 'AirQo contributor'}
            </p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        >
          <Link href={detailHref}>Read more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const BlogsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
      ordering,
    }),
    [currentPage, ordering, searchTerm, selectedCategory],
  );

  const { data, error, isLoading, isFetching, refetch } = useBlogs(queryParams);

  const blogs = data?.results ?? [];
  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedCategory) ||
    ordering !== '-published_at';
  const isInitialLoading = isLoading && blogs.length === 0;
  const isEmpty = !isInitialLoading && !error && blogs.length === 0;

  const resetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedCategory('');
    setOrdering('-published_at');
    setCurrentPage(1);
  };

  return (
    <div className="pb-16">
      <section className="mb-12 bg-[#F2F1F6] px-4 py-16 lg:px-0">
        <div className={`${mainConfig.containerClass} w-full`}>
          <h1 className="mt-3 mb-2 text-4xl font-bold text-gray-900">
            AirQo Blogs
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-gray-600">
            Stories, updates, and insights from AirQo&apos;s work across African
            cities.
          </p>
        </div>
      </section>

      <section className={`${mainConfig.containerClass} p-2 md:p-4`}>
        <Card className="mb-8 border-gray-200 shadow-sm">
          <CardContent className="p-5 lg:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)] lg:items-end">
              <div className="space-y-3">
                <label
                  htmlFor="blog-search"
                  className="text-sm font-semibold text-gray-900"
                >
                  Search blogs
                </label>
                <Input
                  id="blog-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search titles, summaries, or authors"
                  className="h-12 rounded-xl border-gray-200 bg-white px-4 text-base shadow-none focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="blog-category"
                  className="text-sm font-semibold text-gray-900"
                >
                  Category
                </label>
                <select
                  id="blog-category"
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 shadow-none outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {BLOG_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="blog-ordering"
                  className="text-sm font-semibold text-gray-900"
                >
                  Sort by
                </label>
                <select
                  id="blog-ordering"
                  value={ordering}
                  onChange={(event) => {
                    setOrdering(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 shadow-none outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {BLOG_ORDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Reset filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
              Latest stories
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
              {selectedCategory
                ? `${getBlogCategoryLabel(selectedCategory)} stories`
                : 'All blog posts'}
            </h2>
          </div>

          <p className="text-sm text-gray-500">
            {isFetching && !isInitialLoading
              ? 'Updating results…'
              : `${blogs.length} shown`}
          </p>
        </div>

        <Card className="mt-8 border-blue-100 bg-[#F6F9FF] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Explore more AirQo stories
              </p>
              <p className="max-w-2xl text-sm leading-7 text-gray-700 sm:text-base">
                Discover previous AirQo blog posts, updates, and insights from
                our work across African cities.
              </p>
            </div>

            <Button
              asChild
              className="bg-blue-600 text-white hover:bg-blue-700 sm:self-start"
            >
              <a
                href={LEGACY_BLOGS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                View previous blogs
              </a>
            </Button>
          </CardContent>
        </Card>

        {isInitialLoading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : error && blogs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
            <NoData
              className="p-0"
              message="We could not load the latest blog posts right now. Please try again later."
            />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={() => refetch()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear filters
              </Button>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
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
                <Button
                  type="button"
                  onClick={resetFilters}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Reset filters
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Link href="/contact">Contact AirQo</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
      </section>
    </div>
  );
};

export default BlogsPage;
