import { readdirSync, statSync } from 'fs';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ROUTE_TEMPLATES,
  beforeSend,
  getAnalyticsEnvironment,
  getPlatform,
  getRouteTemplate,
  isAnalyticsEnabled,
  sanitizeProperties,
  setActiveOrganization,
  stripUrlDetails,
  trackEvent,
  trackPageview,
  withAppProperties,
} from './analytics';
import type { CaptureResult } from 'posthog-js';

const APP_DIR = path.resolve(__dirname, '../app');

/** Every page route under app/, as a Next.js path such as /devices/overview/[id]. */
function listPageRoutes(dir = APP_DIR, segments: string[] = []): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'api') continue;
      // Route groups such as (authenticated) don't appear in the URL
      const segment = /^\(.*\)$/.test(entry) ? [] : [entry];
      routes.push(...listPageRoutes(full, [...segments, ...segment]));
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry)) {
      routes.push(`/${segments.join('/')}`);
    }
  }
  return routes;
}

const event = (properties: Record<string, unknown>, extra: Partial<CaptureResult> = {}) =>
  ({ uuid: '1', event: '$pageview', properties, ...extra }) as CaptureResult;

describe('route templates', () => {
  it('cover every page in app/, so new pages are reported under their own name', () => {
    const missing = listPageRoutes().filter(
      route => !(ROUTE_TEMPLATES as readonly string[]).includes(route)
    );
    expect(missing, `add these to ROUTE_TEMPLATES in lib/analytics.ts`).toEqual([]);
  });

  it('turn concrete paths into their template', () => {
    expect(getRouteTemplate('/devices/overview/64f0c2a1e4b0a1b2c3d4e5f6')).toBe('/devices/overview/[id]');
    expect(getRouteTemplate('/admin/cohorts/abc/devices/aq_g5_87')).toBe(
      '/admin/cohorts/[id]/devices/[deviceId]'
    );
    expect(getRouteTemplate('/admin/shipping/batch-12')).toBe('/admin/shipping/[batchId]');
    expect(getRouteTemplate('/home')).toBe('/home');
    expect(getRouteTemplate('/')).toBe('/');
  });

  it('prefer a static page over a dynamic one at the same depth', () => {
    expect(getRouteTemplate('/admin/networks/requests')).toBe('/admin/networks/requests');
    expect(getRouteTemplate('/admin/networks/airqo')).toBe('/admin/networks/[id]');
  });

  it('ignore query strings, hashes and trailing slashes', () => {
    expect(getRouteTemplate('/sites/abc?tab=devices#map')).toBe('/sites/[id]');
    expect(getRouteTemplate('/devices/my-devices/')).toBe('/devices/my-devices');
  });

  it('report unknown paths as unmatched rather than the raw path', () => {
    expect(getRouteTemplate('/nope/1/2/3')).toBe('unmatched');
    expect(getRouteTemplate(undefined)).toBe('unmatched');
  });
});

describe('sanitizeProperties', () => {
  it('drops properties that could identify a person or carry typed text', () => {
    expect(
      sanitizeProperties({
        email: 'someone@example.com',
        userEmail: 'someone@example.com',
        firstName: 'Some',
        phoneNumber: '0700000000',
        accessToken: 'JWT abc',
        description: 'free text',
        searchQuery: 'kampala',
        name: 'Device 1',
        method: 'qr',
        device_count: 3,
        has_query: true,
        query_length: 7,
      })
    ).toEqual({ method: 'qr', device_count: 3, has_query: true, query_length: 7 });
  });

  it('keeps values plain and bounded', () => {
    const clean = sanitizeProperties({
      long: 'x'.repeat(500),
      list: Array.from({ length: 80 }, (_, index) => index),
      nested: { status: 'deployed', user_email: 'someone@example.com' },
      callback: () => undefined,
      infinite: Number.POSITIVE_INFINITY,
    });
    expect((clean.long as string).length).toBe(200);
    expect((clean.list as number[]).length).toBe(50);
    expect(clean.nested).toEqual({ status: 'deployed' });
    expect('callback' in clean).toBe(false);
    expect(clean.infinite).toBeNull();
  });
});

describe('before an event is sent', () => {
  it('URLs lose their query string and hash', () => {
    expect(stripUrlDetails('https://vertex.airqo.net/login#token=abc')).toBe('https://vertex.airqo.net/login');
    expect(stripUrlDetails('/devices/overview?search=kampala')).toBe('/devices/overview');

    const sent = beforeSend(
      event(
        {
          $current_url: 'https://vertex.airqo.net/login?token=secret',
          $referrer: 'https://beacon.airqo.net/dashboard/home#token=secret',
          $pathname: '/login',
        },
        { $set_once: { $initial_current_url: 'https://vertex.airqo.net/?token=secret' } }
      )
    )!;
    expect(sent.properties.$current_url).toBe('https://vertex.airqo.net/login');
    expect(sent.properties.$referrer).toBe('https://beacon.airqo.net/dashboard/home');
    expect(sent.properties.$pathname).toBe('/login');
    expect(sent.$set_once!.$initial_current_url).toBe('https://vertex.airqo.net/');
    expect(beforeSend(null)).toBeNull();
  });

  it('every event says which app, environment, platform and context it came from', () => {
    setActiveOrganization(null, 'external-org');
    const sent = withAppProperties(event({ route: '/home', platform: 'custom' }))!;
    expect(sent.properties).toMatchObject({
      app_name: 'vertex',
      environment: 'development',
      platform: 'custom',
      user_context: 'external-org',
      route: '/home',
    });
    expect(withAppProperties(null)).toBeNull();
  });
});

describe('platform', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is desktop inside the Vertex desktop app and web otherwise', () => {
    expect(getPlatform()).toBe('web');
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/128.0 Electron/32.0.0 Safari/537.36'
    );
    expect(getPlatform()).toBe('desktop');
  });
});

describe('environment', () => {
  it('comes from the host, since NODE_ENV is production on staging too', () => {
    expect(getAnalyticsEnvironment('localhost')).toBe('development');
    expect(getAnalyticsEnvironment('127.0.0.1')).toBe('development');
    expect(getAnalyticsEnvironment('vertex.localhost')).toBe('development');
    expect(getAnalyticsEnvironment('staging-vertex.airqo.net')).toBe('staging');
    expect(getAnalyticsEnvironment('vertex-stage.airqo.net')).toBe('staging');
    expect(getAnalyticsEnvironment('vertex.airqo.net')).toBe('production');
  });

  it('falls back to NEXT_PUBLIC_ENV when the page has no host', () => {
    expect(getAnalyticsEnvironment('')).toBe(process.env.NEXT_PUBLIC_ENV || 'development');
  });
});

describe('without NEXT_PUBLIC_POSTHOG_KEY', () => {
  it('nothing is loaded or sent', () => {
    expect(isAnalyticsEnabled()).toBe(false);
    expect(() => trackEvent('device_claimed', { method: 'qr' })).not.toThrow();
    expect(() => trackPageview('/home')).not.toThrow();
  });
});
