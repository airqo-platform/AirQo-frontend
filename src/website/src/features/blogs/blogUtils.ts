import { format } from 'date-fns';

import type { BlogPost } from '@/types/api';

export const BLOG_CATEGORY_OPTIONS = [
  { label: 'All stories', value: '' },
  { label: 'AirQo', value: 'airqo' },
  { label: 'Africa Clean Air', value: 'cleanair' },
] as const;

export const BLOG_ORDER_OPTIONS = [
  { label: 'Newest first', value: '-published_at' },
  { label: 'Oldest first', value: 'published_at' },
  { label: 'Featured order', value: 'order' },
  { label: 'Title A to Z', value: 'title' },
] as const;

export const formatBlogDate = (date?: string | null) => {
  if (!date) return 'Recently';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently';

  return format(parsed, 'MMMM d, yyyy');
};

export const getBlogCategoryLabel = (category?: string | null) => {
  if (!category) return 'Blog';

  const normalized = category.toLowerCase();
  if (normalized === 'airqo') return 'AirQo';
  if (normalized === 'cleanair') return 'Africa Clean Air';

  return category
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const slugifyBlogText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getBlogIdentifier = (
  blog: Pick<BlogPost, 'public_identifier' | 'has_slug' | 'id' | 'title'>,
) => {
  return (
    blog.public_identifier ||
    blog.has_slug ||
    slugifyBlogText(blog.title) ||
    String(blog.id)
  );
};

export const normalizeBlogImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('/')) return url;

  return `/${url.replace(/^\/+/, '')}`;
};
