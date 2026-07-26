import {
  buildSiteUrl,
  detectSiteUrlFromHeaders,
  getPrimarySiteUrl,
  resolveSiteUrl,
} from '@/lib/siteUrl';

describe('siteUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    delete process.env.VERCEL_URL;
    delete process.env.RAILWAY_PUBLIC_DOMAIN;
    delete process.env.RENDER_EXTERNAL_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('detectSiteUrlFromHeaders', () => {
    it('returns null for null header', () => {
      expect(detectSiteUrlFromHeaders(null)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(detectSiteUrlFromHeaders('')).toBeNull();
    });

    it('constructs URL from hostname', () => {
      expect(detectSiteUrlFromHeaders('airqo.africa')).toBe(
        'https://airqo.africa',
      );
    });

    it('preserves port from hostname', () => {
      expect(detectSiteUrlFromHeaders('airqo.africa:443')).toBe(
        'https://airqo.africa:443',
      );
    });

    it('uses custom protocol', () => {
      expect(detectSiteUrlFromHeaders('localhost:3000', 'http')).toBe(
        'http://localhost:3000',
      );
    });

    it('strips trailing slashes', () => {
      expect(detectSiteUrlFromHeaders('airqo.africa/')).toBe(
        'https://airqo.africa',
      );
    });
  });

  describe('getPrimarySiteUrl', () => {
    it('returns URL from Host header when provided', () => {
      expect(getPrimarySiteUrl('airqo.africa')).toBe('https://airqo.africa');
    });

    it('returns URL from Host header with port', () => {
      expect(getPrimarySiteUrl('airqo.africa:8080')).toBe(
        'https://airqo.africa:8080',
      );
    });

    it('returns Vercel URL when no Host header', () => {
      process.env.NEXT_PUBLIC_VERCEL_URL = 'my-app.vercel.app';
      expect(getPrimarySiteUrl()).toBe('https://my-app.vercel.app');
    });

    it('returns localhost fallback when nothing configured', () => {
      expect(getPrimarySiteUrl()).toBe('http://localhost:3000');
    });

    it('prefers Host header over Vercel URL', () => {
      process.env.NEXT_PUBLIC_VERCEL_URL = 'my-app.vercel.app';
      expect(getPrimarySiteUrl('airqo.africa')).toBe('https://airqo.africa');
    });

    it('strips trailing slash from Host header', () => {
      expect(getPrimarySiteUrl('airqo.africa/')).toBe('https://airqo.africa');
    });
  });

  describe('resolveSiteUrl', () => {
    it('returns primary URL when candidate is null', () => {
      expect(resolveSiteUrl(null)).toBe('http://localhost:3000');
    });

    it('returns primary URL when candidate is undefined', () => {
      expect(resolveSiteUrl(undefined)).toBe('http://localhost:3000');
    });

    it('returns primary URL when candidate is empty string', () => {
      expect(resolveSiteUrl('')).toBe('http://localhost:3000');
    });

    it('normalizes candidate with https:// prefix', () => {
      expect(resolveSiteUrl('airqo.africa')).toBe('https://airqo.africa');
    });

    it('normalizes candidate URL', () => {
      expect(resolveSiteUrl('https://airqo.africa/some/path')).toBe(
        'https://airqo.africa/some/path',
      );
    });

    it('uses Host header for primary URL', () => {
      expect(resolveSiteUrl(null, 'airqo.africa')).toBe('https://airqo.africa');
    });
  });

  describe('buildSiteUrl', () => {
    it('combines base URL with path', () => {
      expect(buildSiteUrl('/about', 'https://airqo.africa')).toBe(
        'https://airqo.africa/about',
      );
    });

    it('adds leading slash when path does not have one', () => {
      expect(buildSiteUrl('about', 'https://airqo.africa')).toBe(
        'https://airqo.africa/about',
      );
    });

    it('uses candidate as base when provided', () => {
      expect(buildSiteUrl('/products', 'https://staging.airqo.africa')).toBe(
        'https://staging.airqo.africa/products',
      );
    });

    it('handles deep paths', () => {
      expect(buildSiteUrl('/products/monitor', 'https://airqo.africa')).toBe(
        'https://airqo.africa/products/monitor',
      );
    });

    it('uses primary URL when candidate is null', () => {
      expect(buildSiteUrl('/about', null)).toBe('http://localhost:3000/about');
    });
  });
});
