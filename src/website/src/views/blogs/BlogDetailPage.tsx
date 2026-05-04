import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import mainConfig from '@/configs/mainConfigs';
import type { BlogPost } from '@/services/types/api';

import {
  formatBlogDate,
  getBlogCategoryLabel,
  normalizeBlogImageUrl,
} from './blogUtils';

interface BlogDetailPageProps {
  blog: BlogPost;
}

const BlogDetailPage = ({ blog }: BlogDetailPageProps) => {
  const coverImage = normalizeBlogImageUrl(blog.cover_image_url);
  const authorImage = normalizeBlogImageUrl(blog.author_image_url);
  const publishedLabel = formatBlogDate(blog.published_at);
  const modifiedLabel = blog.modified
    ? format(new Date(blog.modified), 'MMMM d, yyyy')
    : null;

  return (
    <div className="pb-16">
      <section className="mb-8 bg-[#F2F1F6]">
        <div className={`${mainConfig.containerClass} py-12`}>
          <Link
            href="/blogs"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to blogs
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.38fr)] lg:items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                {getBlogCategoryLabel(blog.website_category)} insights
              </span>

              <h1 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                {blog.title}
              </h1>

              <p className="mt-4 text-lg text-gray-700">{blog.summary}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  {authorImage ? (
                    <Image
                      src={authorImage}
                      alt={blog.author_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                      {blog.author_name
                        ? blog.author_name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part.charAt(0))
                            .join('')
                        : 'AQ'}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {blog.author_name || 'AirQo Team'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {blog.author_role || 'AirQo contributor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div>Published {publishedLabel}</div>
                  {modifiedLabel && <div>Updated {modifiedLabel}</div>}
                </div>
              </div>
            </div>

            {/* cover image removed from hero for placement below banner */}
          </div>
        </div>
      </section>

      <section className={`${mainConfig.containerClass} mt-8`}>
        {/* responsive cover image below the banner */}
        {coverImage && (
          <div className="mb-8">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-md shadow-sm">
              <Image
                src={coverImage}
                alt={blog.title}
                width={1200}
                height={630}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] lg:items-start">
          <article className="border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
            <div className="space-y-6 text-[17px] leading-8 text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-slate-950 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-slate-950 [&_p]:leading-8 [&_p]:text-slate-700 [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline-offset-4 [&_a:hover]:underline [&_ul]:space-y-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:space-y-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:bg-blue-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-md [&_img]:shadow-sm [&_table]:my-8 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-slate-900 [&_td]:border-t [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3">
              {blog.content_html ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content_html }} />
              ) : (
                <div className="space-y-5 border border-slate-200 bg-slate-50 p-6 text-slate-700">
                  <h2 className="text-2xl font-semibold text-slate-950">
                    Story summary
                  </h2>
                  <p>{blog.summary}</p>
                  <p>
                    The full article content is not available yet. Check back
                    soon or explore other blog posts from the AirQo team.
                  </p>
                </div>
              )}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                About the author
              </p>
              <div className="mt-4 flex items-center gap-4">
                {authorImage ? (
                  <Image
                    src={authorImage}
                    alt={blog.author_name}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center bg-blue-50 text-lg font-semibold text-blue-700">
                    {blog.author_name
                      ? blog.author_name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join('')
                      : 'AQ'}
                  </div>
                )}

                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    {blog.author_name || 'AirQo Team'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {blog.author_role || 'AirQo contributor'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                AirQo writes about air quality monitoring, community impact,
                policy, technology, and the people using our data to shape
                cleaner cities.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Article details
              </p>

              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {getBlogCategoryLabel(blog.website_category)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="text-slate-500">Published</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {publishedLabel}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {modifiedLabel || '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border border-blue-200 bg-blue-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                Explore more
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Browse the latest AirQo stories, then head back to the blog
                index to discover more posts from the network.
              </p>
              <Link
                href="/blogs"
                className="mt-5 inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to blogs
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default BlogDetailPage;
