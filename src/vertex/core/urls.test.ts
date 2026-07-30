import { describe, it, expect, afterEach, vi } from 'vitest';
import { getEnvironmentAwareUrl } from './urls';

/**
 * `getEnvironmentAwareUrl` keys off the *runtime* hostname rather than NODE_ENV,
 * because the staging deployment is a production Next.js build. These tests stub
 * window.location.hostname to stand in for each environment.
 */
const setHostname = (hostname: string | undefined) => {
  if (hostname === undefined) {
    vi.stubGlobal('window', undefined);
    return;
  }
  vi.stubGlobal('window', { location: { hostname } });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getEnvironmentAwareUrl', () => {
  it('leaves the URL untouched during SSR, when there is no window', () => {
    setHostname(undefined);
    expect(getEnvironmentAwareUrl('https://analytics.airqo.net/')).toBe(
      'https://analytics.airqo.net/'
    );
  });

  it('leaves production URLs untouched when serving from a production host', () => {
    setHostname('vertex.airqo.net');
    expect(getEnvironmentAwareUrl('https://analytics.airqo.net/')).toBe(
      'https://analytics.airqo.net/'
    );
  });

  // The regression this function exists for: the staging deployment is a
  // production build, so a NODE_ENV check handed out production links there.
  it('rewrites to staging when serving from the staging host', () => {
    setHostname('staging-vertex.airqo.net');
    expect(getEnvironmentAwareUrl('https://analytics.airqo.net/')).toBe(
      'https://staging-analytics.airqo.net/'
    );
  });

  it('rewrites to staging when running locally', () => {
    setHostname('localhost');
    expect(getEnvironmentAwareUrl('https://analytics.airqo.net/')).toBe(
      'https://staging-analytics.airqo.net/'
    );
  });

  // Not every app uses the `staging-` prefix — the marketing site is a
  // `staging.` subdomain, which a blind prefix would have turned into the
  // nonexistent `staging-airqo.net`.
  it('maps the marketing site to a staging subdomain, not a prefix', () => {
    setHostname('localhost');
    expect(getEnvironmentAwareUrl('https://airqo.net/')).toBe(
      'https://staging.airqo.net/'
    );
    expect(getEnvironmentAwareUrl('https://www.airqo.net/')).toBe(
      'https://staging.airqo.net/'
    );
  });

  it('preserves path and query when rewriting', () => {
    setHostname('localhost');
    expect(
      getEnvironmentAwareUrl('https://analytics.airqo.net/user/profile?tab=api')
    ).toBe('https://staging-analytics.airqo.net/user/profile?tab=api');
  });

  it('leaves hosts with no known staging deployment unchanged', () => {
    setHostname('localhost');
    expect(getEnvironmentAwareUrl('https://ai.airqo.net')).toBe(
      'https://ai.airqo.net'
    );
    expect(getEnvironmentAwareUrl('https://example.com/x')).toBe(
      'https://example.com/x'
    );
  });

  it('returns unparseable input as-is rather than throwing', () => {
    setHostname('localhost');
    expect(getEnvironmentAwareUrl('not-a-url')).toBe('not-a-url');
  });
});
