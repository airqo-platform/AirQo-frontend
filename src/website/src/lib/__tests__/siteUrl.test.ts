import {
  buildSiteUrl,
  getPrimarySiteUrl,
  parseSiteUrls,
  resolveSiteUrl,
} from '@/lib/siteUrl';

describe('siteUrl', () => {
  const originalEnv = process.env;

  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    delete process.env.NEXT_PUBLIC_REQUIRE_SITE_URL;
    setNodeEnv('test');
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('parseSiteUrls', () => {
    it('returns empty array for null', () => {
      expect(parseSiteUrls(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(parseSiteUrls(undefined)).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(parseSiteUrls('')).toEqual([]);
    });

    it('parses a single comma-separated URL', () => {
      expect(parseSiteUrls('https://airqo.net')).toEqual(['https://airqo.net']);
    });

    it('parses comma-separated URLs', () => {
      const result = parseSiteUrls(
        'https://airqo.net,https://staging.airqo.net',
      );
      expect(result).toEqual([
        'https://airqo.net',
        'https://staging.airqo.net',
      ]);
    });

    it('parses whitespace-separated URLs', () => {
      const result = parseSiteUrls(
        'https://airqo.net https://staging.airqo.net',
      );
      expect(result).toEqual([
        'https://airqo.net',
        'https://staging.airqo.net',
      ]);
    });

    it('parses mixed comma and whitespace separated URLs', () => {
      const result = parseSiteUrls(
        'https://airqo.net, https://staging.airqo.net',
      );
      expect(result).toEqual([
        'https://airqo.net',
        'https://staging.airqo.net',
      ]);
    });

    it('deduplicates URLs', () => {
      const result = parseSiteUrls('https://airqo.net,https://airqo.net');
      expect(result).toEqual(['https://airqo.net']);
    });

    it('adds https:// to bare hostnames', () => {
      const result = parseSiteUrls('airqo.net');
      expect(result).toEqual(['https://airqo.net']);
    });

    it('strips trailing slashes', () => {
      const result = parseSiteUrls('https://airqo.net/');
      expect(result).toEqual(['https://airqo.net']);
    });

    it('strips multiple trailing slashes', () => {
      const result = parseSiteUrls('https://airqo.net///');
      expect(result).toEqual(['https://airqo.net']);
    });

    it('normalizes bare hostnames by prepending https://', () => {
      const result = parseSiteUrls('not-a-url');
      expect(result).toEqual(['https://not-a-url']);
    });

    it('rejects non-http schemes', () => {
      const result = parseSiteUrls('ftp://files.example.com');
      expect(result).toEqual([]);
    });

    it('handles http:// URLs', () => {
      const result = parseSiteUrls('http://localhost:3000');
      expect(result).toEqual(['http://localhost:3000']);
    });

    it('handles multiple spaces', () => {
      const result = parseSiteUrls(
        'https://airqo.net   https://staging.airqo.net',
      );
      expect(result).toEqual([
        'https://airqo.net',
        'https://staging.airqo.net',
      ]);
    });

    it('handles tabs and newlines', () => {
      const result = parseSiteUrls(
        'https://airqo.net\t\nhttps://staging.airqo.net',
      );
      expect(result).toEqual([
        'https://airqo.net',
        'https://staging.airqo.net',
      ]);
    });
  });

  describe('getPrimarySiteUrl', () => {
    it('returns first configured URL when NEXT_PUBLIC_SITE_URL is set', () => {
      process.env.NEXT_PUBLIC_SITE_URL =
        'https://airqo.net,https://staging.airqo.net';
      expect(getPrimarySiteUrl()).toBe('https://airqo.net');
    });

    it('returns Vercel URL when NEXT_PUBLIC_SITE_URL is not set', () => {
      process.env.NEXT_PUBLIC_VERCEL_URL = 'my-app.vercel.app';
      expect(getPrimarySiteUrl()).toBe('https://my-app.vercel.app');
    });

    it('returns localhost fallback when nothing configured', () => {
      expect(getPrimarySiteUrl()).toBe('http://localhost:3000');
    });

    it('returns localhost fallback in non-production without NEXT_PUBLIC_REQUIRE_SITE_URL', () => {
      setNodeEnv('development');
      expect(getPrimarySiteUrl()).toBe('http://localhost:3000');
    });

    it('throws in production when NEXT_PUBLIC_REQUIRE_SITE_URL=true', () => {
      setNodeEnv('production');
      process.env.NEXT_PUBLIC_REQUIRE_SITE_URL = 'true';
      expect(() => getPrimarySiteUrl()).toThrow(
        'NEXT_PUBLIC_SITE_URL must be configured in production.',
      );
    });

    it('falls back to localhost in production when NEXT_PUBLIC_REQUIRE_SITE_URL is not true', () => {
      setNodeEnv('production');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = getPrimarySiteUrl();
      expect(result).toBe('http://localhost:3000');
      warnSpy.mockRestore();
    });

    it('prefers NEXT_PUBLIC_SITE_URL over NEXT_PUBLIC_VERCEL_URL', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'my-app.vercel.app';
      expect(getPrimarySiteUrl()).toBe('https://airqo.net');
    });

    it('strips trailing slash from configured URL', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net/';
      expect(getPrimarySiteUrl()).toBe('https://airqo.net');
    });
  });

  describe('resolveSiteUrl', () => {
    it('returns primary URL when candidate is null', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl(null)).toBe('https://airqo.net');
    });

    it('returns primary URL when candidate is undefined', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl(undefined)).toBe('https://airqo.net');
    });

    it('returns primary URL when candidate is empty string', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl('')).toBe('https://airqo.net');
    });

    it('matches candidate hostname against configured URLs', () => {
      process.env.NEXT_PUBLIC_SITE_URL =
        'https://airqo.net,https://staging.airqo.net';
      expect(resolveSiteUrl('staging.airqo.net')).toBe(
        'https://staging.airqo.net',
      );
    });

    it('returns primary URL when no hostname match found', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl('https://unknown.com')).toBe('https://airqo.net');
    });

    it('normalizes candidate with https:// prefix', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl('airqo.net')).toBe('https://airqo.net');
    });

    it('returns primary URL for invalid candidate', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl('not-a-valid-url!!!')).toBe('https://airqo.net');
    });

    it('matches by hostname ignoring path differences', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(resolveSiteUrl('https://airqo.net/some/path')).toBe(
        'https://airqo.net',
      );
    });
  });

  describe('buildSiteUrl', () => {
    it('combines base URL with path', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(buildSiteUrl('/about')).toBe('https://airqo.net/about');
    });

    it('adds leading slash when path does not have one', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(buildSiteUrl('about')).toBe('https://airqo.net/about');
    });

    it('uses candidate as base when provided', () => {
      process.env.NEXT_PUBLIC_SITE_URL =
        'https://airqo.net,https://staging.airqo.net';
      expect(buildSiteUrl('/products', 'staging.airqo.net')).toBe(
        'https://staging.airqo.net/products',
      );
    });

    it('falls back to primary when candidate does not match', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(buildSiteUrl('/about', 'unknown.com')).toBe(
        'https://airqo.net/about',
      );
    });

    it('handles deep paths', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(buildSiteUrl('/products/monitor')).toBe(
        'https://airqo.net/products/monitor',
      );
    });

    it('uses primary URL when candidate is null', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
      expect(buildSiteUrl('/about', null)).toBe('https://airqo.net/about');
    });
  });
});
