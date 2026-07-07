import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import BlogDetailPage from '@/features/blogs/BlogDetailPage';
import { generateViewport, METADATA_CONFIGS } from '@/lib/metadata';
import { buildSiteUrl } from '@/lib/siteUrl';
import { blogService } from '@/services/website';
import type { BlogPost } from '@/types/api';

export const viewport = generateViewport();

const getAbsoluteUrl = (url: string, requestHost: string | null) =>
  buildSiteUrl(url, requestHost);

const resolveBlogImageUrl = (url: string, requestHost: string | null) => {
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
    return url;
  }

  return getAbsoluteUrl(url, requestHost);
};

const blogCache = new Map<string, Promise<BlogPost | null>>();

function getCachedBlog(slug: string): Promise<BlogPost | null> {
  if (blogCache.has(slug)) {
    return blogCache.get(slug)!;
  }

  const p = (async () => {
    try {
      const result = await blogService.getBlogBySlug(slug);
      return result;
    } catch (err) {
      blogCache.delete(slug);
      throw err;
    }
  })();

  blogCache.set(slug, p);
  return p;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const slug = params.slug;
  const blog = await getCachedBlog(slug);

  if (!blog) {
    return {
      title: METADATA_CONFIGS.blogs.title,
      description: METADATA_CONFIGS.blogs.description,
      alternates: {
        canonical: getAbsoluteUrl('/blogs', requestHost),
      },
    };
  }

  const canonicalSlug =
    blog?.public_identifier?.trim() || String(blog?.id) || slug;
  const canonicalUrl = getAbsoluteUrl(
    `/blogs/${encodeURIComponent(canonicalSlug)}`,
    requestHost,
  );
  const imageUrl = blog.cover_image_url
    ? resolveBlogImageUrl(blog.cover_image_url, requestHost)
    : METADATA_CONFIGS.blogs.image?.url ||
      getAbsoluteUrl('/icon.png', requestHost);

  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.summary,
    keywords: [
      blog.title,
      blog.author_name,
      blog.website_category || 'airqo',
      'AirQo blog',
      'air quality stories',
    ].join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.summary,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      siteName: 'AirQo',
      publishedTime: blog.published_at,
      authors: blog.author_name ? [blog.author_name] : undefined,
      section: blog.website_category || 'Blogs',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.summary,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const blog = await getCachedBlog(params.slug);

  if (!blog) {
    notFound();
  }

  return <BlogDetailPage blog={blog} />;
};

export default Page;
