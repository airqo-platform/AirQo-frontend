import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { AFRICA_CLEAN_AIR_FORUM_URL, NAV_ITEMS } from '@/lib/navItems';

const getAppRoutes = (
  directory = path.join(process.cwd(), 'src', 'app'),
  segments: string[] = [],
): string[] => {
  const routes: string[] = [];

  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      if (entry.startsWith('@')) continue;

      const isRouteGroup = entry.startsWith('(') && entry.endsWith(')');
      routes.push(
        ...getAppRoutes(
          entryPath,
          isRouteGroup ? segments : [...segments, entry],
        ),
      );
      continue;
    }

    if (entry === 'page.tsx' || entry === 'page.ts') {
      routes.push(segments.length ? `/${segments.join('/')}` : '/');
    }
  }

  return routes;
};

const routeMatches = (route: string, pathname: string) => {
  const pattern = route
    .split('/')
    .filter(Boolean)
    .reduce((result, segment) => {
      if (/^\[\[\.\.\..+\]\]$/.test(segment)) return `${result}(?:/.+)?`;
      if (/^\[\.\.\..+\]$/.test(segment)) return `${result}/.+`;
      if (/^\[.+\]$/.test(segment)) return `${result}/[^/]+`;

      return `${result}/${segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
    }, '^');

  return new RegExp(`${pattern}/?$`).test(pathname);
};

describe('NAV_ITEMS', () => {
  it('exposes the task-based primary navigation sections', () => {
    expect(Object.keys(NAV_ITEMS)).toEqual([
      'Products',
      'Solutions',
      'Developers',
      'Resources',
      'About AirQo',
    ]);
  });

  it('makes technical documentation discoverable from Resources', () => {
    expect(NAV_ITEMS.Resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Technical documentation',
          href: '/resources?tab=technical',
        }),
        expect.objectContaining({
          title: 'Research & publications',
          href: '/resources?tab=research',
        }),
        expect.objectContaining({
          title: 'Guides & manuals',
          href: '/resources?tab=guide,manual',
        }),
        expect.objectContaining({
          title: 'AirQo API data access',
          href: 'https://platform.airqo.net/docs/api/intro/',
        }),
      ]),
    );
  });

  it('links Partners to the existing About AirQo section', () => {
    expect(NAV_ITEMS['About AirQo']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Partners',
          href: '/about-us#partners',
        }),
      ]),
    );
  });

  it('links Africa Clean Air Forum to its official annual forum page', () => {
    expect(NAV_ITEMS['About AirQo']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Africa Clean Air Forum',
          href: AFRICA_CLEAN_AIR_FORUM_URL,
          newTab: true,
        }),
      ]),
    );
  });

  it('does not duplicate destinations inside a navigation section', () => {
    Object.values(NAV_ITEMS).forEach((items) => {
      const hrefs = items.map((item) => item.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });
  });

  it('marks external destinations to open safely in a new tab', () => {
    Object.values(NAV_ITEMS)
      .flat()
      .filter((item) => item.href.startsWith('http'))
      .forEach((item) => expect(item.newTab).toBe(true));
  });

  it('points every internal navigation item to an App Router page', () => {
    const routes = getAppRoutes();

    Object.values(NAV_ITEMS)
      .flat()
      .filter((item) => item.href.startsWith('/'))
      .forEach((item) => {
        const pathname = new URL(item.href, 'https://airqo.net').pathname;
        const hasPage = routes.some((route) => routeMatches(route, pathname));

        if (!hasPage) {
          throw new Error(
            `Navigation item "${item.title}" points to missing route ${pathname}`,
          );
        }
      });
  });
});
