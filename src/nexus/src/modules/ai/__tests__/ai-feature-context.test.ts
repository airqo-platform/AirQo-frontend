import { getFeatureFromPathname, getPageMetadata } from '../context/ai-feature-context';
import type { AiFeatureId } from '../types';

describe('getFeatureFromPathname', () => {
  const cases: [string, AiFeatureId][] = [
    // home
    ['/user/home', 'home'],
    ['/', 'home'],
    ['/org/abc/dashboard', 'home'],
    ['/org/my-org/dashboard/settings', 'home'],
    ['/org/123/dashboard/', 'home'],

    // map (user flow)
    ['/user/map', 'map'],
    ['/map', 'map'],
    ['/map/', 'map'],
    ['/org/acme/map', 'map'],

    // data-export (user flow)
    ['/user/data-export', 'data-export'],
    ['/data-export', 'data-export'],
    ['/data-export/', 'data-export'],
    ['/org/acme/data-export', 'data-export'],

    // analytics (user flow)
    ['/user/air-quality/analytics', 'analytics'],
    ['/air-quality/analytics', 'analytics'],
    ['/air-quality/analytics/', 'analytics'],
    ['/org/acme/air-quality/analytics', 'analytics'],

    // data-visualizer (user flow)
    ['/user/data-visualizer', 'data-visualizer'],
    ['/data-visualizer', 'data-visualizer'],
    ['/data-visualizer/', 'data-visualizer'],
    ['/org/acme/data-visualizer', 'data-visualizer'],

    // rankings (user flow)
    ['/user/air-quality/rankings', 'rankings'],
    ['/air-quality/rankings', 'rankings'],
    ['/air-quality/rankings/', 'rankings'],
    ['/org/acme/air-quality/rankings', 'rankings'],

    // profile (user flow)
    ['/user/profile', 'profile'],
    ['/profile', 'profile'],
    ['/profile/', 'profile'],
    ['/org/acme/profile', 'profile'],

    // general (fallback)
    ['/unknown', 'general'],
    ['/air-quality', 'general'],
    ['/user/login', 'general'],
    ['/settings', 'general'],
  ];

  it.each(cases)('maps "%s" to "%s"', (pathname, expected) => {
    expect(getFeatureFromPathname(pathname)).toBe(expected);
  });

  it('handles trailing slashes consistently', () => {
    expect(getFeatureFromPathname('/map/')).toBe('map');
    expect(getFeatureFromPathname('/map///')).toBe('map');
    expect(getFeatureFromPathname('/profile/')).toBe('profile');
    expect(getFeatureFromPathname('/user/map/')).toBe('map');
    expect(getFeatureFromPathname('/user/air-quality/rankings/')).toBe('rankings');
  });

  it('returns "home" for empty string (normalised to "/")', () => {
    expect(getFeatureFromPathname('')).toBe('home');
  });
});

describe('getPageMetadata', () => {
  it('returns feature, pageTitle, and pageDescription for each route', () => {
    const cases: { pathname: string; feature: AiFeatureId; title: string; description: string }[] = [
      { pathname: '/user/home', feature: 'home', title: 'Home', description: 'Your personalized air quality dashboard' },
      { pathname: '/', feature: 'home', title: 'Home', description: 'Your personalized air quality dashboard' },
      { pathname: '/org/abc/dashboard', feature: 'home', title: 'Home', description: 'Your personalized air quality dashboard' },
      { pathname: '/user/map', feature: 'map', title: 'Air Quality Map', description: 'Live air quality across monitored locations' },
      { pathname: '/map', feature: 'map', title: 'Air Quality Map', description: 'Live air quality across monitored locations' },
      { pathname: '/user/data-export', feature: 'data-export', title: 'Visualization & Data Export', description: 'Download air quality measurement data' },
      { pathname: '/data-export', feature: 'data-export', title: 'Visualization & Data Export', description: 'Download air quality measurement data' },
      { pathname: '/user/air-quality/analytics', feature: 'analytics', title: 'Air Quality Analysis', description: 'Compare and analyze air quality trends' },
      { pathname: '/air-quality/analytics', feature: 'analytics', title: 'Air Quality Analysis', description: 'Compare and analyze air quality trends' },
      { pathname: '/user/data-visualizer', feature: 'data-visualizer', title: 'Data Visualizer', description: 'Upload and visualize air quality datasets' },
      { pathname: '/data-visualizer', feature: 'data-visualizer', title: 'Data Visualizer', description: 'Upload and visualize air quality datasets' },
      { pathname: '/user/air-quality/rankings', feature: 'rankings', title: 'Air Quality Rankings', description: 'Compare locations by air quality' },
      { pathname: '/air-quality/rankings', feature: 'rankings', title: 'Air Quality Rankings', description: 'Compare locations by air quality' },
      { pathname: '/user/profile', feature: 'profile', title: 'Profile & Account Settings', description: 'Manage your account' },
      { pathname: '/profile', feature: 'profile', title: 'Profile & Account Settings', description: 'Manage your account' },
      { pathname: '/unknown', feature: 'general', title: 'AirQo Nexus', description: 'Air quality insights platform' },
    ];

    for (const { pathname, feature, title, description } of cases) {
      const meta = getPageMetadata(pathname);
      expect(meta.feature).toBe(feature);
      expect(meta.pageTitle).toBe(title);
      expect(meta.pageDescription).toBe(description);
    }
  });

  it('strips trailing slashes before matching', () => {
    const meta = getPageMetadata('/map/');
    expect(meta.feature).toBe('map');
    expect(meta.pageTitle).toBe('Air Quality Map');
  });

  it('returns general metadata for empty string', () => {
    const meta = getPageMetadata('');
    expect(meta.feature).toBe('home');
    expect(meta.pageTitle).toBe('Home');
  });

  it('returns correct metadata for /user/ prefixed routes', () => {
    const analyticsMeta = getPageMetadata('/user/air-quality/analytics');
    expect(analyticsMeta.feature).toBe('analytics');
    expect(analyticsMeta.pageTitle).toBe('Air Quality Analysis');

    const profileMeta = getPageMetadata('/user/profile');
    expect(profileMeta.feature).toBe('profile');
    expect(profileMeta.pageTitle).toBe('Profile & Account Settings');
  });
});
