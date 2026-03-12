import { MetadataRoute } from 'next';

const FORUM_ROUTE_CONFIG = [
  { suffix: '/about', changeFrequency: 'weekly' as const, priority: 0.9 },
  { suffix: '/speakers', changeFrequency: 'weekly' as const, priority: 0.7 },
  { suffix: '/sessions', changeFrequency: 'weekly' as const, priority: 0.7 },
  {
    suffix: '/logistics',
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  },
  {
    suffix: '/resources',
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  },
  { suffix: '/partners', changeFrequency: 'monthly' as const, priority: 0.6 },
  {
    suffix: '/sponsorships',
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    suffix: '/program-committee',
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  { suffix: '/glossary', changeFrequency: 'monthly' as const, priority: 0.4 },
] as const;

const FORUM_TITLES_ENDPOINT = '/forum-event-titles/';
const EVENTS_ENDPOINT = '/events/';
const CAREERS_ENDPOINT = '/careers/';
const PARTNERS_ENDPOINT = '/partners/';
const MAX_PAGINATED_API_PAGES = 20;
const DEFAULT_FORUM_FETCH_TIMEOUT_MS = 8000;

interface ForumEventTitle {
  unique_title: string;
  created?: string;
  modified?: string;
}

interface PaginatedApiResponse<T> {
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

interface ContentRouteItem {
  id?: string | number;
  public_identifier?: string;
  created_at?: string;
  updated_at?: string;
  created?: string;
  modified?: string;
}

type SitemapChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]['changeFrequency']
>;

const normalizeForumApiBaseUrl = (rawApiUrl: string): string => {
  const trimmed = rawApiUrl.replace(/\/$/, '');
  if (trimmed.endsWith('/website/api/v2')) return trimmed;
  if (trimmed.endsWith('/api/v2')) {
    return trimmed.replace(/\/api\/v2$/, '/website/api/v2');
  }
  return `${trimmed}/website/api/v2`;
};

const getForumFetchTimeoutMs = (): number => {
  const timeout = Number.parseInt(
    process.env.FORUM_SITEMAP_FETCH_TIMEOUT_MS || '',
    10,
  );
  if (Number.isFinite(timeout) && timeout > 0) {
    return timeout;
  }
  return DEFAULT_FORUM_FETCH_TIMEOUT_MS;
};

const getForumAuthHeaders = (token?: string): HeadersInit => {
  if (!token) return { Accept: 'application/json' };
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const getSitemapApiConfig = () => {
  const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!rawApiUrl) return null;

  return {
    apiBaseUrl: normalizeForumApiBaseUrl(rawApiUrl),
    fetchTimeoutMs: getForumFetchTimeoutMs(),
    authHeaders: getForumAuthHeaders(process.env.API_TOKEN),
  };
};

const removeTokenFromUrl = (url: string): string => {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      parsed.searchParams.delete('token');
      return parsed.toString();
    }

    const [beforeHash, hash = ''] = url.split('#', 2);
    const [pathname, query = ''] = beforeHash.split('?', 2);
    const params = new URLSearchParams(query);
    params.delete('token');

    const cleanQuery = params.toString();
    const rebuilt = `${pathname}${cleanQuery ? `?${cleanQuery}` : ''}`;
    return hash ? `${rebuilt}#${hash}` : rebuilt;
  } catch {
    return url;
  }
};

const resolveNextUrl = (nextUrl: string, apiBaseUrl: string): string | null => {
  const sanitizedNextUrl = removeTokenFromUrl(nextUrl).trim();

  try {
    const apiBase = new URL(
      apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`,
    );
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(sanitizedNextUrl);
    const isProtocolRelative = sanitizedNextUrl.startsWith('//');

    if (hasScheme || isProtocolRelative) {
      const absoluteNext = new URL(sanitizedNextUrl, apiBase);
      if (absoluteNext.origin !== apiBase.origin) {
        console.error('Discarding cross-origin pagination URL in sitemap:', {
          apiOrigin: apiBase.origin,
          nextOrigin: absoluteNext.origin,
        });
        return null;
      }
      absoluteNext.searchParams.delete('token');
      return absoluteNext.toString();
    }

    const resolvedRelative = new URL(sanitizedNextUrl, apiBase);
    resolvedRelative.searchParams.delete('token');
    return resolvedRelative.toString();
  } catch (error) {
    const typedError = error as Error;
    console.error('Failed to resolve pagination URL in sitemap:', {
      nextUrl: sanitizedNextUrl,
      message: typedError.message,
      name: typedError.name,
    });
    return null;
  }
};

const parseValidDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isForumEventTitle = (event: unknown): event is ForumEventTitle => {
  if (!event || typeof event !== 'object') return false;
  const title = (event as ForumEventTitle).unique_title;
  return typeof title === 'string' && title.trim().length > 0;
};

const isContentRouteItem = (item: unknown): item is ContentRouteItem => {
  if (!item || typeof item !== 'object') return false;
  const contentItem = item as ContentRouteItem;
  const hasPublicIdentifier =
    typeof contentItem.public_identifier === 'string' &&
    contentItem.public_identifier.trim().length > 0;
  const hasId =
    typeof contentItem.id === 'string' || typeof contentItem.id === 'number';
  return hasPublicIdentifier || hasId;
};

const getContentSlug = (item: ContentRouteItem): string | null => {
  if (
    typeof item.public_identifier === 'string' &&
    item.public_identifier.trim().length > 0
  ) {
    return item.public_identifier.trim();
  }

  if (typeof item.id === 'string' && item.id.trim().length > 0) {
    return item.id.trim();
  }

  if (typeof item.id === 'number') {
    return String(item.id);
  }

  return null;
};

const getContentLastModified = (
  item: ContentRouteItem,
  fallbackDate: Date,
): Date => {
  return (
    parseValidDate(item.updated_at) ??
    parseValidDate(item.modified) ??
    parseValidDate(item.created_at) ??
    parseValidDate(item.created) ??
    fallbackDate
  );
};

const fetchPaginatedItems = async <T>({
  endpoint,
  isValidItem,
}: {
  endpoint: string;
  isValidItem: (item: unknown) => item is T;
}): Promise<T[]> => {
  const apiConfig = getSitemapApiConfig();
  if (!apiConfig) return [];

  const { apiBaseUrl, fetchTimeoutMs, authHeaders } = apiConfig;
  let nextUrl: string | null = `${apiBaseUrl}${endpoint}?page_size=100`;
  const allItems: T[] = [];

  for (
    let pageCount = 0;
    nextUrl && pageCount < MAX_PAGINATED_API_PAGES;
    pageCount += 1
  ) {
    const controller = new AbortController();
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, fetchTimeoutMs);

    try {
      const response = await fetch(nextUrl, {
        next: { revalidate: 86400 },
        headers: authHeaders,
        signal: controller.signal,
      });

      if (!response.ok) {
        // Some deployments may not expose all optional sitemap endpoints.
        // Treat a first-page 404 as "no entries" instead of a hard failure.
        if (response.status === 404 && pageCount === 0) {
          break;
        }
        console.error('Sitemap fetch failed:', {
          url: nextUrl,
          status: response.status,
          statusText: response.statusText,
        });
        break;
      }

      const data: PaginatedApiResponse<T> = await response.json();
      const sanitizedData: PaginatedApiResponse<T> = {
        ...data,
        next:
          typeof data.next === 'string' ? removeTokenFromUrl(data.next) : null,
        previous:
          typeof data.previous === 'string'
            ? removeTokenFromUrl(data.previous)
            : null,
      };
      const pageResults = (data.results || []).filter(isValidItem);

      allItems.push(...pageResults);

      if (!sanitizedData.next) {
        nextUrl = null;
      } else {
        nextUrl = resolveNextUrl(sanitizedData.next, apiBaseUrl);
      }
    } catch (error) {
      const typedError = error as Error;
      console.error('Sitemap pagination request failed:', {
        url: nextUrl,
        timeout: didTimeout,
        message: typedError.message,
        name: typedError.name,
      });
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  return allItems;
};

const fetchForumEventTitles = async (): Promise<ForumEventTitle[]> => {
  const allEvents = await fetchPaginatedItems<ForumEventTitle>({
    endpoint: FORUM_TITLES_ENDPOINT,
    isValidItem: isForumEventTitle,
  });

  // Deduplicate by unique_title in case the API returns repeated rows across pages
  const deduplicated = new Map<string, ForumEventTitle>();
  allEvents.forEach((event) => {
    deduplicated.set(event.unique_title, event);
  });

  return Array.from(deduplicated.values());
};

const fetchContentRouteItems = async (
  endpoint: string,
): Promise<ContentRouteItem[]> => {
  const allItems = await fetchPaginatedItems<ContentRouteItem>({
    endpoint,
    isValidItem: isContentRouteItem,
  });

  const deduplicated = new Map<string, ContentRouteItem>();
  allItems.forEach((item) => {
    const slug = getContentSlug(item);
    if (slug) deduplicated.set(slug, item);
  });

  return Array.from(deduplicated.values());
};

const buildContentDetailRoutes = ({
  items,
  basePath,
  baseUrl,
  currentDate,
  changeFrequency,
  priority,
}: {
  items: ContentRouteItem[];
  basePath: string;
  baseUrl: string;
  currentDate: Date;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
}): MetadataRoute.Sitemap => {
  return items.flatMap((item) => {
    const slug = getContentSlug(item);
    if (!slug) return [];

    return [
      {
        url: `${baseUrl}${basePath}/${encodeURIComponent(slug)}`,
        lastModified: getContentLastModified(item, currentDate),
        changeFrequency,
        priority,
      },
    ];
  });
};

export const revalidate = 86400; // refresh daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://airqo.net';
  const baseUrl = rawBase.replace(/\/$/, '');
  const currentDate = new Date();

  const staticRouteConfig: Array<{
    path: string;
    changeFrequency: SitemapChangeFrequency;
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    {
      path: '/billboard/interactive',
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    { path: '/about-us', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/products/monitor', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/products/analytics', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/products/api', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/products/mobile-app', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/products/calibrate', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/packages', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/packages/icons', changeFrequency: 'weekly', priority: 0.7 },
    {
      path: '/packages/icons/docs',
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      path: '/solutions/african-cities',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: '/solutions/communities',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { path: '/solutions/research', changeFrequency: 'monthly', priority: 0.8 },
    {
      path: '/solutions/network-coverage',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: '/solutions/kampala-study',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: '/africa-clean-air-forum',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { path: '/careers', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/events', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/press', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/resources', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/faqs', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.8 },
    { path: '/explore-data', changeFrequency: 'hourly', priority: 0.95 },
    {
      path: '/explore-data/mobile-app',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      path: '/legal/terms-of-service',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    { path: '/legal/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/legal/airqo-data', changeFrequency: 'yearly', priority: 0.3 },
    {
      path: '/legal/payment-refund-policy',
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticRouteConfig.map(
    (route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: currentDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  const [forumEvents, eventItems, careerItems, partnerItems] =
    await Promise.all([
      fetchForumEventTitles(),
      fetchContentRouteItems(EVENTS_ENDPOINT),
      fetchContentRouteItems(CAREERS_ENDPOINT),
      fetchContentRouteItems(PARTNERS_ENDPOINT),
    ]);

  const forumEventRoutes: MetadataRoute.Sitemap = forumEvents.flatMap(
    (event) => {
      const encodedTitle = encodeURIComponent(event.unique_title);
      const eventLastModified =
        parseValidDate(event.modified) ??
        parseValidDate(event.created) ??
        currentDate;

      return FORUM_ROUTE_CONFIG.map((route) => ({
        url: `${baseUrl}/africa-clean-air-forum/${encodedTitle}${route.suffix}`,
        lastModified: eventLastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }));
    },
  );

  const eventDetailRoutes = buildContentDetailRoutes({
    items: eventItems,
    basePath: '/events',
    baseUrl,
    currentDate,
    changeFrequency: 'weekly',
    priority: 0.65,
  });

  const careerDetailRoutes = buildContentDetailRoutes({
    items: careerItems,
    basePath: '/careers',
    baseUrl,
    currentDate,
    changeFrequency: 'weekly',
    priority: 0.65,
  });

  const partnerDetailRoutes = buildContentDetailRoutes({
    items: partnerItems,
    basePath: '/partners',
    baseUrl,
    currentDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  });

  return [
    ...staticRoutes,
    ...forumEventRoutes,
    ...eventDetailRoutes,
    ...careerDetailRoutes,
    ...partnerDetailRoutes,
  ];
}
