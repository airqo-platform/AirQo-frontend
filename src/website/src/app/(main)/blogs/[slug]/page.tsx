import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { generateViewport, METADATA_CONFIGS } from '@/lib/metadata';
import { buildSiteUrl } from '@/lib/siteUrl';
import { blogService } from '@/services/apiService';
import BlogDetailPage from '@/views/blogs/BlogDetailPage';

export const viewport = generateViewport();

const getAbsoluteUrl = (url: string, requestHost: string | null) =>
  buildSiteUrl(url, requestHost);

const resolveBlogImageUrl = (url: string, requestHost: string | null) => {
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
    return url;
  }

  return getAbsoluteUrl(url, requestHost);
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const slug = params.slug;
  const blog = await blogService.getBlogBySlug(slug);

  if (!blog) {
    return {
      title: METADATA_CONFIGS.blogs.title,
      description: METADATA_CONFIGS.blogs.description,
      alternates: {
        canonical: getAbsoluteUrl('/blogs', requestHost),
      },
    };
  }

  const canonicalUrl = getAbsoluteUrl(
    `/blogs/${encodeURIComponent(slug)}`,
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
  const blog = await blogService.getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  return <BlogDetailPage blog={blog} />;
};

export default Page;
