import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import BlogDetailPage from '@/features/blogs/BlogDetailPage';
import {
  cleanMetadataText,
  generateViewport,
  METADATA_CONFIGS,
  resolveMetadataImage,
} from '@/lib/metadata';
import { buildSiteUrl, getPrimarySiteUrl } from '@/lib/siteUrl';
import { blogService } from '@/services/website';
import type { BlogPost } from '@/types/api';

export const viewport = generateViewport();

const getAbsoluteUrl = (
  url: string,
  requestHost: string | null,
  requestProtocol: string,
) => buildSiteUrl(url, undefined, requestHost, requestProtocol);

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
  const requestProtocol =
    requestHeaders.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const slug = params.slug;
  let blog: BlogPost | null = null;
  try {
    blog = await getCachedBlog(slug);
  } catch {
    // Keep a useful, non-indexable fallback when the content API is unavailable.
  }

  if (!blog) {
    return {
      title: { absolute: METADATA_CONFIGS.blogs.title },
      description: METADATA_CONFIGS.blogs.description,
      alternates: {
        canonical: getAbsoluteUrl('/blogs', requestHost, requestProtocol),
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const canonicalSlug =
    blog?.public_identifier?.trim() || String(blog?.id) || slug;
  const canonicalUrl = getAbsoluteUrl(
    `/blogs/${encodeURIComponent(canonicalSlug)}`,
    requestHost,
    requestProtocol,
  );
  const title =
    blog.meta_title?.trim() ||
    blog.title?.trim() ||
    METADATA_CONFIGS.blogs.title;
  const description = cleanMetadataText(
    blog.meta_description || blog.summary,
    METADATA_CONFIGS.blogs.description,
  );
  const imageUrl = resolveMetadataImage(
    blog.cover_image_url,
    getPrimarySiteUrl(requestHost, requestProtocol),
  );

  return {
    title: { absolute: title },
    description,
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
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
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
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
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
