export type HomeExperienceMode = 'new' | 'returning';

export type HomeExperienceItemType =
  | 'comparison'
  | 'visualizer-draft'
  | 'saved-locations'
  | 'saved-charts';

export interface HomeExperienceItem {
  type: HomeExperienceItemType;
  title: string;
  description: string;
  href: string;
  timestamp?: string;
  iconName?: string;
}

export interface HomeLocationUpdate {
  name: string;
  href?: string;
  aqiIndex: number | null;
  aqiCategory: string | null;
  measuredAt?: string;
}

export interface HomeExperienceCounts {
  savedLocations: number;
  charts: number;
  comparisons: number;
  drafts: number;
}

export interface HomeExperienceData {
  mode: HomeExperienceMode;
  continueItems: HomeExperienceItem[];
  locationUpdates: HomeLocationUpdate[];
  counts: HomeExperienceCounts;
  isLoading: boolean;
  updatesLoading: boolean;
  hasPartialError: boolean;
}

export type HomeDemoMode = 'new' | 'returning' | 'loading' | 'error';
