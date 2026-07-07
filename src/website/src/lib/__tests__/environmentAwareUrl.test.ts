import { getEnvironmentAwareUrl } from '@/lib/environmentAwareUrl';

describe('getEnvironmentAwareUrl', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).window;
  });

  describe('server-side (no window)', () => {
    beforeEach(() => {
      delete (global as any).window;
    });

    it('returns baseUrl as-is when window is undefined', () => {
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://beacon.airqo.net',
      );
    });

    it('returns baseUrl for airqo.net on server', () => {
      expect(getEnvironmentAwareUrl('https://airqo.net')).toBe(
        'https://airqo.net',
      );
    });

    it('returns baseUrl for vertex on server', () => {
      expect(getEnvironmentAwareUrl('https://vertex.airqo.net/api')).toBe(
        'https://vertex.airqo.net/api',
      );
    });
  });

  describe('production environment (non-staging)', () => {
    beforeEach(() => {
      (global as any).window = {
        location: {
          href: 'https://airqo.net/home',
          hostname: 'airqo.net',
        },
      };
    });

    it('returns baseUrl unchanged for beacon.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://beacon.airqo.net',
      );
    });

    it('returns baseUrl unchanged for vertex.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://vertex.airqo.net/api')).toBe(
        'https://vertex.airqo.net/api',
      );
    });

    it('returns baseUrl unchanged for airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://airqo.net')).toBe(
        'https://airqo.net',
      );
    });

    it('returns baseUrl unchanged for www.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://www.airqo.net/path')).toBe(
        'https://www.airqo.net/path',
      );
    });

    it('returns baseUrl unchanged for unknown host', () => {
      expect(getEnvironmentAwareUrl('https://other.service.com')).toBe(
        'https://other.service.com',
      );
    });
  });

  describe('staging environment', () => {
    beforeEach(() => {
      (global as any).window = {
        location: {
          href: 'https://staging.airqo.net/home',
          hostname: 'staging.airqo.net',
        },
      };
    });

    it('rewrites beacon.airqo.net to staging-beacon.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://staging-beacon.airqo.net/',
      );
    });

    it('rewrites vertex.airqo.net to staging-vertex.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://vertex.airqo.net/api')).toBe(
        'https://staging-vertex.airqo.net/api',
      );
    });

    it('rewrites airqo.net to staging.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://airqo.net')).toBe(
        'https://staging.airqo.net/',
      );
    });

    it('rewrites www.airqo.net to staging.airqo.net', () => {
      expect(getEnvironmentAwareUrl('https://www.airqo.net/path')).toBe(
        'https://staging.airqo.net/path',
      );
    });

    it('returns baseUrl unchanged for unknown host on staging', () => {
      expect(getEnvironmentAwareUrl('https://other.service.com')).toBe(
        'https://other.service.com',
      );
    });

    it('preserves path when rewriting beacon URL', () => {
      expect(
        getEnvironmentAwareUrl('https://beacon.airqo.net/v1/devices'),
      ).toBe('https://staging-beacon.airqo.net/v1/devices');
    });

    it('preserves query params when rewriting vertex URL', () => {
      expect(
        getEnvironmentAwareUrl('https://vertex.airqo.net/api?token=abc'),
      ).toBe('https://staging-vertex.airqo.net/api?token=abc');
    });
  });

  describe('staging detection via hostname substring', () => {
    it('detects staging from hostname containing "staging"', () => {
      (global as any).window = {
        location: {
          href: 'https://app-staging.example.com/home',
          hostname: 'app-staging.example.com',
        },
      };
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://staging-beacon.airqo.net/',
      );
    });

    it('detects staging from href hostname containing "staging"', () => {
      (global as any).window = {
        location: {
          href: 'https://staging-app.example.com/home',
          hostname: 'staging-app.example.com',
        },
      };
      expect(getEnvironmentAwareUrl('https://vertex.airqo.net')).toBe(
        'https://staging-vertex.airqo.net/',
      );
    });
  });

  describe('localhost treated as staging', () => {
    it('rewrites for localhost hostname', () => {
      (global as any).window = {
        location: {
          href: 'http://localhost:3000/home',
          hostname: 'localhost',
        },
      };
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://staging-beacon.airqo.net/',
      );
    });

    it('rewrites for 127.0.0.1 hostname', () => {
      (global as any).window = {
        location: {
          href: 'http://127.0.0.1:3000/home',
          hostname: '127.0.0.1',
        },
      };
      expect(getEnvironmentAwareUrl('https://vertex.airqo.net')).toBe(
        'https://staging-vertex.airqo.net/',
      );
    });

    it('rewrites for ::1 hostname', () => {
      (global as any).window = {
        location: {
          href: 'http://[::1]:3000/home',
          hostname: '::1',
        },
      };
      expect(getEnvironmentAwareUrl('https://airqo.net')).toBe(
        'https://staging.airqo.net/',
      );
    });

    it('rewrites for 0.0.0.0 hostname', () => {
      (global as any).window = {
        location: {
          href: 'http://0.0.0.0:3000/home',
          hostname: '0.0.0.0',
        },
      };
      expect(getEnvironmentAwareUrl('https://www.airqo.net/path')).toBe(
        'https://staging.airqo.net/path',
      );
    });
  });

  describe('error handling', () => {
    it('returns baseUrl when window.location is missing', () => {
      (global as any).window = {};
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://beacon.airqo.net',
      );
    });

    it('returns baseUrl when baseUrl is invalid', () => {
      (global as any).window = {
        location: {
          href: 'https://localhost:3000',
          hostname: 'localhost',
        },
      };
      expect(getEnvironmentAwareUrl('not-a-valid-url')).toBe('not-a-valid-url');
    });

    it('returns baseUrl when href is invalid causing URL parse failure', () => {
      (global as any).window = {
        location: {
          href: 'not-a-valid-url',
          hostname: 'localhost',
        },
      };
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://staging-beacon.airqo.net/',
      );
    });

    it('handles missing window.location.href', () => {
      (global as any).window = {
        location: {
          hostname: 'localhost',
        },
      };
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://staging-beacon.airqo.net/',
      );
    });

    it('handles missing window.location.hostname gracefully', () => {
      (global as any).window = {
        location: {
          href: 'http://localhost:3000',
        },
      };
      expect(getEnvironmentAwareUrl('https://beacon.airqo.net')).toBe(
        'https://beacon.airqo.net',
      );
    });
  });
});
