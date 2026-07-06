import { useQuery } from '@tanstack/react-query';

import { blogService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function useBlogs(params?: {
  page?: number;
  page_size?: number;
  category?: string[];
  search?: string;
  ordering?: string;
}) {
  return useQuery({
    queryKey: apiQueryKeys.blogs(params),
    queryFn: () => blogService.getBlogs({}, params),
  });
}

export function useBlogDetails(slug: string | null) {
  return useQuery({
    queryKey: apiQueryKeys.blogDetails(slug),
    queryFn: () => blogService.getBlogBySlug(slug!),
    enabled: !!slug,
  });
}

export function useBlogIdentifiers(slug: string | null) {
  return useQuery({
    queryKey: apiQueryKeys.blogIdentifiers(slug),
    queryFn: () => blogService.getBlogIdentifiers(slug!),
    enabled: !!slug,
  });
}
