interface PaginatedApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ListParams {
  page?: number;
  page_size?: number;
}

interface NormalizedListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page_size: number;
  total_pages: number;
  current_page: number;
}

/**
 * Normalizes a paginated API response into a consistent list shape
 * with computed pagination fields.
 */
export function normalizeListResponse<T>(
  response: PaginatedApiResponse<T>,
  params: ListParams,
): NormalizedListResponse<T> {
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
}
