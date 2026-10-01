import {
  isInternalAppPath,
  resolveSiteDetailsBackTarget,
  siteDetailsBackLabel,
  withSiteDetailsFrom,
} from '../siteDetailsNavigation';

describe('isInternalAppPath', () => {
  it('accepts absolute same-app paths', () => {
    expect(isInternalAppPath('/user/home')).toBe(true);
    expect(isInternalAppPath('/org/acme/data-export')).toBe(true);
    expect(isInternalAppPath('/user/map?site=1')).toBe(true);
  });

  it('rejects anything that could leave the app', () => {
    // Protocol-relative and backslash forms are the classic open-redirect
    // bypasses; a crafted `from` must never become a breadcrumb target.
    expect(isInternalAppPath('//evil.com')).toBe(false);
    expect(isInternalAppPath('/\\evil.com')).toBe(false);
    expect(isInternalAppPath('/user/\\evil')).toBe(false);
    expect(isInternalAppPath('https://evil.com')).toBe(false);
    expect(isInternalAppPath('javascript:alert(1)')).toBe(false);
    expect(isInternalAppPath('user/home')).toBe(false);
    expect(isInternalAppPath('')).toBe(false);
    expect(isInternalAppPath(null)).toBe(false);
    expect(isInternalAppPath(undefined)).toBe(false);
  });
});

describe('withSiteDetailsFrom', () => {
  it('adds the origin while preserving the existing query', () => {
    expect(
      withSiteDetailsFrom(
        '/user/air-quality/analytics/sites/akwa?site_id=abc',
        '/user/home'
      )
    ).toBe(
      '/user/air-quality/analytics/sites/akwa?site_id=abc&from=%2Fuser%2Fhome'
    );
  });

  it('adds the origin to a bare path', () => {
    expect(
      withSiteDetailsFrom('/user/data-export/sites/gulu', '/user/map')
    ).toBe('/user/data-export/sites/gulu?from=%2Fuser%2Fmap');
  });

  it('leaves the href untouched when the origin is unsafe or missing', () => {
    expect(
      withSiteDetailsFrom('/user/map/sites/gulu?site_id=1', '//evil.com')
    ).toBe('/user/map/sites/gulu?site_id=1');
    expect(withSiteDetailsFrom('/user/map/sites/gulu?site_id=1', null)).toBe(
      '/user/map/sites/gulu?site_id=1'
    );
  });

  it('replaces an existing from rather than duplicating it', () => {
    expect(
      withSiteDetailsFrom(
        '/user/map/sites/gulu?site_id=1&from=%2Fuser%2Fhome',
        '/org/acme/data-export'
      )
    ).toBe('/user/map/sites/gulu?site_id=1&from=%2Forg%2Facme%2Fdata-export');
  });
});

describe('siteDetailsBackLabel', () => {
  it('labels the pages that can own a location detail view', () => {
    expect(siteDetailsBackLabel('/user/home')).toBe('Home');
    expect(siteDetailsBackLabel('/user/air-quality/analytics')).toBe(
      'Analytics'
    );
    expect(siteDetailsBackLabel('/user/map')).toBe('Map');
    expect(siteDetailsBackLabel('/user/data-export')).toBe('Data Export');
    expect(siteDetailsBackLabel('/user/data-visualizer')).toBe(
      'Data Visualizer'
    );
    expect(siteDetailsBackLabel('/user/air-quality/rankings')).toBe('Rankings');
  });

  it('ignores the account prefix so org and user routes share labels', () => {
    expect(siteDetailsBackLabel('/org/acme/data-export')).toBe('Data Export');
    expect(siteDetailsBackLabel('/org/acme/air-quality/analytics')).toBe(
      'Analytics'
    );
  });

  it('ignores query strings and returns null for unknown routes', () => {
    expect(siteDetailsBackLabel('/user/home?view=comparison')).toBe('Home');
    expect(siteDetailsBackLabel('/user/settings/billing')).toBeNull();
  });
});

describe('resolveSiteDetailsBackTarget', () => {
  const fallback = {
    fallbackHref: '/user/air-quality/analytics',
    fallbackLabel: 'Analytics',
  };

  it('prefers the recorded origin', () => {
    expect(
      resolveSiteDetailsBackTarget({ from: '/user/map', ...fallback })
    ).toEqual({
      href: '/user/map',
      label: 'Map',
      fromRecordedOrigin: true,
    });
  });

  it('falls back to the host page for direct links and bookmarks', () => {
    expect(resolveSiteDetailsBackTarget({ from: null, ...fallback })).toEqual({
      href: '/user/air-quality/analytics',
      label: 'Analytics',
      fromRecordedOrigin: false,
    });
  });

  it('falls back rather than trusting an unsafe or unknown origin', () => {
    expect(
      resolveSiteDetailsBackTarget({ from: '//evil.com', ...fallback })
    ).toEqual({
      href: '/user/air-quality/analytics',
      label: 'Analytics',
      fromRecordedOrigin: false,
    });
    expect(
      resolveSiteDetailsBackTarget({
        from: '/user/settings/billing',
        ...fallback,
      })
    ).toEqual({
      href: '/user/air-quality/analytics',
      label: 'Analytics',
      fromRecordedOrigin: false,
    });
  });
});
