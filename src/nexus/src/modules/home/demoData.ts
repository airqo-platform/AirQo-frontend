import type { HomeDemoMode, HomeExperienceData } from './types';

const EMPTY_COUNTS = {
  savedLocations: 0,
  charts: 0,
  comparisons: 0,
  drafts: 0,
};

export const getHomeDemoData = (mode: HomeDemoMode): HomeExperienceData => {
  if (mode === 'loading') {
    return {
      mode: 'new',
      continueItems: [],
      activeComparison: null,
      locationUpdates: [],
      counts: EMPTY_COUNTS,
      isLoading: true,
      updatesLoading: true,
      hasPartialError: false,
    };
  }

  if (mode === 'returning') {
    return {
      mode: 'returning',
      activeComparison: { id: 'demo-comparison', name: 'Kampala and Nairobi' },
      continueItems: [
        {
          type: 'comparison',
          title: 'Kampala and Nairobi',
          description: 'Continue comparing 2 locations.',
          href: '/user/air-quality/analytics?view=comparison',
          timestamp: new Date(Date.now() - 86_400_000).toISOString(),
          iconName: 'compare',
        },
        {
          type: 'visualizer-draft',
          title: 'Research dataset draft',
          description: 'Resume 4 charts across 2 datasets.',
          href: '/user/data-visualizer',
          timestamp: new Date(Date.now() - 172_800_000).toISOString(),
          iconName: 'visualize',
        },
        {
          type: 'saved-charts',
          title: 'Saved trend charts',
          description: 'Open your 3 saved charts and continue the analysis.',
          href: '/user/air-quality/analytics?view=trends',
          iconName: 'charts',
        },
      ],
      locationUpdates: [
        {
          name: 'Makerere University',
          aqiIndex: 42,
          aqiCategory: 'Good',
          measuredAt: new Date(Date.now() - 1_800_000).toISOString(),
        },
        {
          name: 'Central Kampala',
          aqiIndex: 78,
          aqiCategory: 'Moderate',
          measuredAt: new Date(Date.now() - 3_600_000).toISOString(),
        },
      ],
      counts: {
        savedLocations: 4,
        charts: 3,
        comparisons: 1,
        drafts: 1,
      },
      isLoading: false,
      updatesLoading: false,
      hasPartialError: false,
    };
  }

  return {
    mode: 'new',
    continueItems: [],
    activeComparison: null,
    locationUpdates: [],
    counts: EMPTY_COUNTS,
    isLoading: false,
    updatesLoading: false,
    hasPartialError: mode === 'error',
  };
};
