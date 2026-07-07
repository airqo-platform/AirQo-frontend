/**
 * @jest-environment node
 */
import { getEnvironmentAwareUrl } from '../url';

describe('getEnvironmentAwareUrl', () => {
  const originalWindow = (globalThis as unknown as Record<string, unknown>)
    .window;

  afterEach(() => {
    (globalThis as unknown as Record<string, unknown>).window = originalWindow;
  });

  afterAll(() => {
    (globalThis as unknown as Record<string, unknown>).window = originalWindow;
  });

  it('returns baseUrl when window is undefined (SSR)', () => {
    delete (globalThis as unknown as Record<string, unknown>).window;
    const result = getEnvironmentAwareUrl('https://airqo.net/api');
    expect(result).toBe('https://airqo.net/api');
  });

  it('returns baseUrl unchanged for non-AirQo production hosts', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: {
        hostname: 'example.com',
        href: 'https://example.com/dashboard',
      },
    };
    const result = getEnvironmentAwareUrl('https://airqo.net/api');
    expect(result).toBe('https://airqo.net/api');
  });

  it('maps airqo.net to staging.airqo.net on localhost', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: { hostname: 'localhost', href: 'http://localhost:3000' },
    };
    const result = getEnvironmentAwareUrl('https://airqo.net/api');
    expect(result).toBe('https://staging.airqo.net/api');
  });

  it('maps vertex.airqo.net to staging-vertex.airqo.net on localhost', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: { hostname: 'localhost', href: 'http://localhost:3000' },
    };
    const result = getEnvironmentAwareUrl('https://vertex.airqo.net/api');
    expect(result).toBe('https://staging-vertex.airqo.net/api');
  });

  it('maps beacon.airqo.net to staging-beacon.airqo.net on localhost', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: { hostname: 'localhost', href: 'http://localhost:3000' },
    };
    const result = getEnvironmentAwareUrl('https://beacon.airqo.net/api');
    expect(result).toBe('https://staging-beacon.airqo.net/api');
  });

  it('maps nexus.airqo.net to staging-nexus.airqo.net on localhost', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: { hostname: 'localhost', href: 'http://localhost:3000' },
    };
    const result = getEnvironmentAwareUrl('https://nexus.airqo.net/api');
    expect(result).toBe('https://staging-nexus.airqo.net/api');
  });

  it('returns unchanged for staging hosts', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: {
        hostname: 'staging.airqo.net',
        href: 'https://staging.airqo.net/dashboard',
      },
    };
    const result = getEnvironmentAwareUrl('https://some-other-site.com/api');
    expect(result).toBe('https://some-other-site.com/api');
  });

  it('handles URL parse errors gracefully', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      location: { hostname: 'localhost', href: 'http://localhost:3000' },
    };
    const result = getEnvironmentAwareUrl('not-a-valid-url');
    expect(result).toBe('not-a-valid-url');
  });
});
