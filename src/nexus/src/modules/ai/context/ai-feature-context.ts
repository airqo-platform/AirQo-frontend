import type { AiFeatureId } from '../types';
import { FEATURE_LABELS } from '../constants';

export { FEATURE_LABELS };

/**
 * Map a Next.js pathname to an `AiFeatureId`.
 */
export function getFeatureFromPathname(pathname: string): AiFeatureId {
  const path = pathname.replace(/\/+$/, '') || '/';

  // Org dashboard
  if (/^\/org\/[^/]+\/dashboard/.test(path)) return 'home';

  // Org flow: /org/{slug}/{feature} → recurse on the feature path
  const orgMatch = path.match(/^\/org\/[^/]+\/(.+)$/);
  if (orgMatch) {
    return getFeatureFromPathname(`/${orgMatch[1]}`);
  }

  // User flow: strip the /user prefix
  const userPath = path.startsWith('/user') ? path.slice('/user'.length) || '/' : path;

  if (userPath === '/home' || userPath === '/') return 'home';
  if (userPath === '/map') return 'map';
  if (userPath === '/data-export') return 'data-export';
  if (userPath === '/air-quality/analytics') return 'analytics';
  if (userPath === '/data-visualizer') return 'data-visualizer';
  if (userPath === '/air-quality/rankings') return 'rankings';
  if (userPath === '/profile') return 'profile';

  return 'general';
}

/* -------------------------------------------------------------------------- */
/*  Page metadata                                                              */
/* -------------------------------------------------------------------------- */

export interface AiPageMetadata {
  feature: AiFeatureId;
  pageTitle: string;
  pageDescription: string;
}

const PAGE_METADATA: Record<AiFeatureId, { title: string; description: string }> = {
  home: {
    title: FEATURE_LABELS.home,
    description: 'Your personalized air quality dashboard',
  },
  map: {
    title: FEATURE_LABELS.map,
    description: 'Live air quality across monitored locations',
  },
  'data-export': {
    title: FEATURE_LABELS['data-export'],
    description: 'Download air quality measurement data',
  },
  analytics: {
    title: FEATURE_LABELS.analytics,
    description: 'Compare and analyze air quality trends',
  },
  'data-visualizer': {
    title: FEATURE_LABELS['data-visualizer'],
    description: 'Upload and visualize air quality datasets',
  },
  rankings: {
    title: FEATURE_LABELS.rankings,
    description: 'Compare locations by air quality',
  },
  profile: {
    title: FEATURE_LABELS.profile,
    description: 'Manage your account',
  },
  general: {
    title: FEATURE_LABELS.general,
    description: 'Air quality insights platform',
  },
};

/**
 * Map a pathname to full page metadata (feature, title, description).
 */
export function getPageMetadata(pathname: string): AiPageMetadata {
  const feature = getFeatureFromPathname(pathname);
  const meta = PAGE_METADATA[feature];
  return {
    feature,
    pageTitle: meta.title,
    pageDescription: meta.description,
  };
}
