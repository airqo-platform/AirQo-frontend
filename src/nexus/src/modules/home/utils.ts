import type {
  SavedComparison,
  UserChartConfig,
  UserPreference,
} from '@/shared/types/api';
import type { VisualizerWorkspaceDraft } from '@/modules/data-visualizer/types';
import type { HomeExperienceItem, HomeExperienceMode } from './types';

interface BuildContinueItemsOptions {
  comparisons: SavedComparison[];
  draft: VisualizerWorkspaceDraft | null;
  preference: UserPreference | null;
  charts: UserChartConfig[];
}

export const getHomeExperienceMode = ({
  savedLocationCount,
  chartCount,
  comparisonCount,
  hasDraft,
}: {
  savedLocationCount: number;
  chartCount: number;
  comparisonCount: number;
  hasDraft: boolean;
}): HomeExperienceMode =>
  savedLocationCount > 0 || chartCount > 0 || comparisonCount > 0 || hasDraft
    ? 'returning'
    : 'new';

const validTimestamp = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? value : undefined;
};

export const buildContinueItems = ({
  comparisons,
  draft,
  preference,
  charts,
}: BuildContinueItemsOptions): HomeExperienceItem[] => {
  const items: HomeExperienceItem[] = [];
  const latestComparison = [...comparisons].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
  )[0];

  if (latestComparison) {
    items.push({
      type: 'comparison',
      title: latestComparison.name || 'Saved comparison',
      description: `Continue comparing ${latestComparison.site_ids.length} location${latestComparison.site_ids.length === 1 ? '' : 's'}.`,
      href: '/user/air-quality/analytics?view=comparison',
      timestamp: validTimestamp(latestComparison.updated_at),
      iconName: 'compare',
    });
  }

  if (draft) {
    items.push({
      type: 'visualizer-draft',
      title: 'Uploaded dataset draft',
      description: `Resume ${draft.charts.length} chart${draft.charts.length === 1 ? '' : 's'} across ${draft.datasets.length} dataset${draft.datasets.length === 1 ? '' : 's'}.`,
      href: '/user/data-visualizer',
      timestamp: validTimestamp(draft.savedAt),
      iconName: 'visualize',
    });
  }

  const savedLocationCount = preference?.selected_sites?.length ?? 0;
  if (savedLocationCount > 0) {
    items.push({
      type: 'saved-locations',
      title: 'Your saved locations',
      description: `Review readings for ${savedLocationCount} saved location${savedLocationCount === 1 ? '' : 's'}.`,
      href: '/user/air-quality/analytics?view=comparison',
      timestamp: validTimestamp(preference?.lastAccessed),
      iconName: 'locations',
    });
  }

  if (charts.length > 0) {
    items.push({
      type: 'saved-charts',
      title: 'Saved trend charts',
      description: `Open your ${charts.length} saved chart${charts.length === 1 ? '' : 's'} and continue the analysis.`,
      href: '/user/air-quality/analytics?view=trends',
      iconName: 'charts',
    });
  }

  return items.slice(0, 3);
};
