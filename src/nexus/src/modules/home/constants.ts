import {
  AqDownload01,
  AqGlobe05,
  AqPresentationChart02,
  AqTrophy01,
  AqUpload01,
} from '@airqo/icons-react';

/**
 * Single switch for the adaptive homepage: when false the legacy homepage is
 * served instead. This is the only `NEXT_PUBLIC_HOME_*` read in the module —
 * `NEXT_PUBLIC_*` values are inlined at build time, so changing it requires a
 * rebuild rather than just a redeploy.
 */
export const ADAPTIVE_HOME_ENABLED =
  process.env.NEXT_PUBLIC_HOME_V2_ENABLED === 'true';

export const OUTCOME_ACTIONS = [
  {
    id: 'compare-places',
    title: 'Compare places',
    description: 'Review current readings from several locations side-by-side.',
    href: '/user/air-quality/analytics?view=comparison&homeStart=compare-places',
    icon: AqPresentationChart02,
  },
  {
    id: 'analyze-trends',
    title: 'Analyze trends',
    description:
      'Build and save charts for the pollutants and periods you need.',
    href: '/user/air-quality/analytics?view=trends&homeStart=analyze-trends',
    icon: AqPresentationChart02,
  },
  {
    id: 'explore-location',
    title: 'Explore a location',
    description: 'See current conditions, forecasts, and health guidance.',
    href: '/user/map?homeStart=explore-location',
    icon: AqGlobe05,
  },
  {
    id: 'visualize-data',
    title: 'Visualize my data',
    description: 'Upload a file and turn it into export-ready charts or maps.',
    href: '/user/data-visualizer?homeStart=visualize-data',
    icon: AqUpload01,
  },
  {
    id: 'export-data',
    title: 'Export data',
    description: 'Configure and preview AirQo data for your own analysis.',
    href: '/user/data-export?homeStart=export-data',
    icon: AqDownload01,
  },
  {
    id: 'view-rankings',
    title: 'Compare cities and countries',
    description:
      'Explore live and historical air-quality rankings across Africa.',
    href: '/user/air-quality/rankings?homeStart=view-rankings',
    icon: AqTrophy01,
  },
] as const;

/** Analytics comparison tab — the target of every "compare places" entry point. */
export const READINGS_HREF = '/user/air-quality/analytics?view=comparison';

export const HOME_HINTS = [
  {
    text: 'Compare a few places in one table.',
    href: READINGS_HREF,
  },
  {
    text: 'Build a chart for the places you care about.',
    href: '/user/air-quality/analytics?view=trends',
  },
  {
    text: 'See which cities are cleanest across Africa.',
    href: '/user/air-quality/rankings',
  },
  {
    text: 'Export data for your own analysis.',
    href: '/user/data-export',
  },
  {
    text: 'Turn a spreadsheet into a chart or map.',
    href: '/user/data-visualizer',
  },
] as const;
