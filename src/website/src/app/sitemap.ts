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

const FORUM_TITLES_ENDPOINT = '/website/api/v2/forum-event-titles/';
const MAX_FORUM_API_PAGES = 20;

interface ForumEventTitle {
  unique_title: string;
  created?: string;
  modified?: string;
}

interface ForumEventTitlesResponse {
  next?: string | null;
  results?: ForumEventTitle[];
}

const normalizeApiBaseUrl = (rawApiUrl: string): string => {
  const trimmed = rawApiUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api/v2') ? trimmed : `${trimmed}/api/v2`;
};

const withToken = (url: string, token?: string): string => {
  if (!token) return url;

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('token')) {
      parsed.searchParams.set('token', token);
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

const resolveNextUrl = (
  nextUrl: string,
  apiBaseUrl: string,
  token?: string,
): string => {
  const resolved = nextUrl.startsWith('http')
    ? nextUrl
    : `${apiBaseUrl}${nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`}`;

  return withToken(resolved, token);
};

const fetchForumEventTitles = async (): Promise<ForumEventTitle[]> => {
  const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!rawApiUrl) {
    return [];
  }

  const apiBaseUrl = normalizeApiBaseUrl(rawApiUrl);
  const apiToken = process.env.API_TOKEN;

  let nextUrl: string | null = withToken(
    `${apiBaseUrl}${FORUM_TITLES_ENDPOINT}?page_size=100`,
    apiToken,
  );

  const allEvents: ForumEventTitle[] = [];

  for (
    let pageCount = 0;
    nextUrl && pageCount < MAX_FORUM_API_PAGES;
    pageCount += 1
  ) {
    try {
      const response = await fetch(nextUrl, {
        next: { revalidate: 86400 },
      });

      if (!response.ok) {
        break;
      }

      const data: ForumEventTitlesResponse = await response.json();
      const pageResults = (data.results || []).filter(
        (event): event is ForumEventTitle =>
          typeof event?.unique_title === 'string' &&
          event.unique_title.trim().length > 0,
      );

      allEvents.push(...pageResults);

      if (!data.next) {
        nextUrl = null;
      } else {
        nextUrl = resolveNextUrl(data.next, apiBaseUrl, apiToken);
      }
    } catch {
      break;
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
        (event.modified && new Date(event.modified)) ||
        (event.created && new Date(event.created)) ||
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
