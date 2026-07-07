'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { sanitizeAndCleanHTML } from '@/lib/utils/htmlValidator';
import type { BlogPost } from '@/types/api';

import {
  formatBlogDate,
  getBlogCategoryLabel,
  normalizeBlogImageUrl,
} from './blogUtils';

interface BlogDetailPageProps {
  blog: BlogPost;
}

const CoverImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="max-w-[800px] mx-auto mt-8 px-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

const BlogDetailPage = ({ blog }: BlogDetailPageProps) => {
  const coverImage = normalizeBlogImageUrl(blog.cover_image_url);
  const authorImage = normalizeBlogImageUrl(blog.author_image_url);
  const publishedLabel = formatBlogDate(blog.published_at);
  const modifiedLabel = blog.modified
    ? format(new Date(blog.modified), 'MMMM d, yyyy')
    : null;

  return (
    <div className="bg-white">
      <section className="border-b border-gray-200 bg-[#FAFBFC]">
        <div className="max-w-[800px] mx-auto py-12 px-4">
          <Link
            href="/blogs"
            className="text-[14px] font-medium text-blue-600 hover:underline"
          >
            ← All articles
          </Link>

          <div className="mt-8">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-blue-600">
              {getBlogCategoryLabel(blog.website_category)}
            </span>

            <h1 className="mt-3 text-[36px] font-semibold tracking-[-0.02em] text-[#111827] leading-[1.2]">
              {blog.title}
            </h1>

            <p className="mt-4 text-[18px] text-[#6b7280] leading-[1.5]">
              {blog.summary}
            </p>

            <div className="mt-6 flex items-center gap-3 text-[14px] text-[#9ca3af]">
              <div className="flex items-center gap-2.5">
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
                  <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[12px] font-medium text-[#6b7280]">
                    {blog.author_name?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="text-[#374151] font-medium">
                  {blog.author_name || 'AirQo Team'}
                </span>
              </div>
              <span>·</span>
              <span>{publishedLabel}</span>
              {modifiedLabel && (
                <>
                  <span>·</span>
                  <span>Updated {modifiedLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {coverImage && <CoverImage src={coverImage} alt={blog.title} />}

      <article className="max-w-[800px] mx-auto py-12 px-4">
        {blog.content_html ? (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeAndCleanHTML(blog.content_html),
            }}
          />
        ) : (
          <div>
            <h2>Story summary</h2>
            <p>{blog.summary}</p>
            <p>
              The full article content is not available yet. Check back soon.
            </p>
          </div>
        )}
      </article>

      <div className="max-w-[800px] mx-auto px-4 pb-16">
        <div className="flex items-start gap-4 py-6 border-t border-gray-200">
          {authorImage ? (
            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0">
              <Image
                src={authorImage}
                alt={blog.author_name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[14px] font-medium text-[#6b7280]">
              {blog.author_name?.charAt(0) || 'A'}
            </div>
          )}
          <div>
            <p className="text-[15px] font-semibold text-[#111827]">
              {blog.author_name || 'AirQo Team'}
            </p>
            <p className="text-[14px] text-[#6b7280] mt-0.5">
              {blog.author_role || 'AirQo contributor'}
            </p>
            <p className="text-[14px] text-[#6b7280] mt-2 leading-[1.5]">
              AirQo writes about air quality monitoring, community impact,
              policy, technology, and the people using our data to shape cleaner
              cities.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 pb-16">
        <div className="flex items-center gap-6 text-[13px] text-[#9ca3af] py-4 border-t border-gray-200">
          <span>
            Published:{' '}
            <span className="text-[#374151] font-medium">{publishedLabel}</span>
          </span>
          {modifiedLabel && (
            <span>
              Updated:{' '}
              <span className="text-[#374151] font-medium">
                {modifiedLabel}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
