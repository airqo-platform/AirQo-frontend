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
const MAX_FORUM_API_PAGES = 20;
const DEFAULT_FORUM_FETCH_TIMEOUT_MS = 8000;

interface ForumEventTitle {
  unique_title: string;
  created?: string;
  modified?: string;
}

interface ForumEventTitlesResponse {
  next?: string | null;
  previous?: string | null;
  results?: ForumEventTitle[];
}

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
  const sanitizedNextUrl = removeTokenFromUrl(nextUrl);

  try {
    const apiBase = new URL(
      apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`,
    );

    if (
      sanitizedNextUrl.startsWith('http://') ||
      sanitizedNextUrl.startsWith('https://')
    ) {
      const absoluteNext = new URL(sanitizedNextUrl);
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

const fetchForumEventTitles = async (): Promise<ForumEventTitle[]> => {
  const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!rawApiUrl) {
    return [];
  }

  const apiBaseUrl = normalizeForumApiBaseUrl(rawApiUrl);
  const apiToken = process.env.API_TOKEN;
  const fetchTimeoutMs = getForumFetchTimeoutMs();
  const authHeaders = getForumAuthHeaders(apiToken);

  let nextUrl: string | null =
    `${apiBaseUrl}${FORUM_TITLES_ENDPOINT}?page_size=100`;

  const allEvents: ForumEventTitle[] = [];

  for (
    let pageCount = 0;
    nextUrl && pageCount < MAX_FORUM_API_PAGES;
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
        console.error('Forum sitemap fetch failed:', {
          url: nextUrl,
          status: response.status,
          statusText: response.statusText,
        });
        break;
      }

      const data: ForumEventTitlesResponse = await response.json();
      const sanitizedData: ForumEventTitlesResponse = {
        ...data,
        next:
          typeof data.next === 'string' ? removeTokenFromUrl(data.next) : null,
        previous:
          typeof data.previous === 'string'
            ? removeTokenFromUrl(data.previous)
            : null,
      };
      const pageResults = (data.results || []).filter(
        (event): event is ForumEventTitle =>
          typeof event?.unique_title === 'string' &&
          event.unique_title.trim().length > 0,
      );

      allEvents.push(...pageResults);

      if (!sanitizedData.next) {
        nextUrl = null;
      } else {
        nextUrl = resolveNextUrl(sanitizedData.next, apiBaseUrl);
      }
    } catch (error) {
      const typedError = error as Error;
      console.error('Forum sitemap pagination request failed:', {
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

  // Deduplicate by unique_title in case the API returns repeated rows across pages
  const deduplicated = new Map<string, ForumEventTitle>();
  allEvents.forEach((event) => {
    deduplicated.set(event.unique_title, event);
  });

  return Array.from(deduplicated.values());
};

export const revalidate = 86400; // refresh daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://airqo.net';
  const baseUrl = rawBase.replace(/\/$/, '');
  const currentDate = new Date();

  // Define all static routes with their priorities and change frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    // Interactive tools and data visualization (HIGH PRIORITY for engagement)
    {
      url: `${baseUrl}/billboard/interactive`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Products
    {
      url: `${baseUrl}/products/monitor`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/analytics`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/api`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/mobile-app`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/calibrate`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Packages (Developer Resources)
    {
      url: `${baseUrl}/packages`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/packages/icons`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Solutions
    {
      url: `${baseUrl}/solutions/african-cities`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/solutions/communities`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/solutions/research`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Africa Clean Air Forum landing page
    {
      url: `${baseUrl}/africa-clean-air-forum`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // About pages
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    // Contact
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    // Explore Data
    {
      url: `${baseUrl}/explore-data`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    // Legal
    {
      url: `${baseUrl}/legal/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/airqo-data`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/payment-refund-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const forumEvents = await fetchForumEventTitles();

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

  return [...staticRoutes, ...forumEventRoutes];
}
