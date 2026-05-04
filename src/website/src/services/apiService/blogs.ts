import BaseApiService, { ServiceOptions } from '../base';
import {
  BlogIdentifierPayload,
  BlogListResponse,
  BlogPost,
} from '../types/api';

const BLOGS_ENDPOINTS = {
  BLOGS: '/website/api/v2/blogs/',
  BLOG_BY_SLUG: (slug: string) =>
    `/website/api/v2/blogs/by-slug/${encodeURIComponent(slug)}/`,
  BLOG_DETAILS: (slug: string) =>
    `/website/api/v2/blogs/${encodeURIComponent(slug)}/`,
  BLOG_IDENTIFIERS: (slug: string) =>
    `/website/api/v2/blogs/${encodeURIComponent(slug)}/identifiers/`,
  BULK_IDENTIFIERS: '/website/api/v2/blogs/bulk-identifiers/',
} as const;

type BlogListParams = {
  page?: number;
  page_size?: number;
  category?: string | string[];
  search?: string;
  ordering?: string;
};

const slugifyBlogText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

type BlogListApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
};

const normalizeBlogListResponse = (
  response: BlogListApiResponse,
  params: BlogListParams,
): BlogListResponse => {
  const pageSize = (params.page_size ?? response.results.length) || 10;

  return {
    count: response.count ?? 0,
    next: response.next ?? null,
    previous: response.previous ?? null,
    results: response.results ?? [],
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil((response.count ?? 0) / pageSize)),
    current_page: params.page ?? 1,
  };
};

class BlogService extends BaseApiService {
  constructor() {
    super('BlogService');
  }

  async getBlogs(
    options: ServiceOptions = {},
    params: BlogListParams = {},
  ): Promise<BlogListResponse> {
    const response = await this.get<BlogListApiResponse>(
      BLOGS_ENDPOINTS.BLOGS,
      params,
      {
        ...options,
        throwOnError: false,
      },
    );

    if (response.success) {
      return normalizeBlogListResponse(response.data, params);
    }

    return normalizeBlogListResponse(
      {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      params,
    );
  }

  async getBlogBySlug(
    slug: string,
    options: ServiceOptions = {},
  ): Promise<BlogPost | null> {
    const candidatesSet = new Set<string>();
    candidatesSet.add(slug);
    try {
      const decoded = decodeURIComponent(slug);
      if (decoded) candidatesSet.add(decoded);
    } catch {
      // ignore malformed escape sequences and continue with the raw slug
    }

    const candidates = Array.from(candidatesSet);

    for (const candidate of candidates) {
      const bySlugResponse = await this.get<BlogPost>(
        BLOGS_ENDPOINTS.BLOG_BY_SLUG(candidate),
        undefined,
        {
          ...options,
          throwOnError: false,
        },
      );

      if (bySlugResponse.success) {
        return bySlugResponse.data;
      }

      const detailResponse = await this.get<BlogPost>(
        BLOGS_ENDPOINTS.BLOG_DETAILS(candidate),
        undefined,
        {
          ...options,
          throwOnError: false,
        },
      );

      if (detailResponse.success) {
        return detailResponse.data;
      }
    }

    const listResponse = await this.get<BlogListApiResponse>(
      BLOGS_ENDPOINTS.BLOGS,
      { page_size: 1000 },
      {
        ...options,
        throwOnError: false,
      },
    );

    if (!listResponse.success) {
      return null;
    }

    const normalizedSlug = slugifyBlogText(slug);
    const slugLower = String(slug).toLowerCase();

    const match = (listResponse.data.results ?? []).find((blog) => {
      const pubId = blog.public_identifier?.trim().toLowerCase();
      const hasSlug = (blog as any).has_slug?.trim().toLowerCase();
      const blogTitleSlug = slugifyBlogText(blog.title);

      return (
        pubId === slugLower ||
        hasSlug === slugLower ||
        blogTitleSlug === normalizedSlug ||
        String(blog.id) === slug
      );
    });

    return match ?? null;
  }

  async getBlogIdentifiers(
    slug: string,
    options: ServiceOptions = {},
  ): Promise<BlogPost | null> {
    const response = await this.get<BlogPost>(
      BLOGS_ENDPOINTS.BLOG_IDENTIFIERS(slug),
      undefined,
      {
        ...options,
        throwOnError: false,
      },
    );

    return response.success ? response.data : null;
  }

  async createBulkIdentifiers(
    payload: BlogIdentifierPayload,
    options: ServiceOptions = {},
  ): Promise<BlogPost | null> {
    const response = await this.post<BlogPost>(
      BLOGS_ENDPOINTS.BULK_IDENTIFIERS,
      payload,
      {
        ...options,
        throwOnError: false,
      },
    );

    return response.success ? response.data : null;
  }
}

export const blogService = new BlogService();
export default blogService;
