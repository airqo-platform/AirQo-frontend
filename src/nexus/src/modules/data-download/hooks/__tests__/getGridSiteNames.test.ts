jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));
jest.mock('posthog-js/react', () => ({
  usePostHog: () => undefined,
}));
jest.mock('@/shared/hooks/useAnalytics', () => ({
  useDownloadData: () => ({ trigger: jest.fn(), isMutating: false }),
}));
jest.mock('@/shared/store/insightsSlice', () => ({
  openMoreInsights: jest.fn(),
}));
jest.mock('@/shared/components/ui/toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock('@/shared/utils/errorMessages', () => ({
  getUserFriendlyErrorMessage: jest.fn(),
}));
jest.mock('@/shared/utils/analytics', () => ({
  trackEvent: jest.fn(),
}));
jest.mock('@/shared/utils/enhancedAnalytics', () => ({
  trackFeatureUsage: jest.fn(),
}));
jest.mock('@/shared/components/calendar/types', () => ({}));

import { getGridSiteNames } from '../useDataExportActions';
import { TableItem } from '../../types/dataExportTypes';

const makeSite = (
  _id: string,
  name?: string,
  search_name?: string,
  formatted_name?: string,
  location_name?: string
) => ({ _id, name: name ?? '', search_name, formatted_name, location_name });

const makeGridData = (sites: ReturnType<typeof makeSite>[]): TableItem[] => [
  { _id: 'grid-1', sites } as unknown as TableItem,
];

describe('getGridSiteNames', () => {
  const gridSites: Record<string, string[]> = {
    'grid-1': ['site-1', 'site-2', 'site-3'],
  };
  const gridData = makeGridData([
    makeSite('site-1', 'Site Alpha'),
    makeSite('site-2', 'Site Beta'),
    makeSite(
      'site-3',
      undefined,
      'Site Gamma Search',
      'Site Gamma',
      'Site Gamma Location'
    ),
  ]);

  it('returns exactly one label per id in resolveGridSitesForDownload order', () => {
    const labels = getGridSiteNames(
      'countries',
      ['grid-1'],
      {},
      gridSites,
      gridData
    );
    expect(labels).toEqual(['Site Alpha', 'Site Beta', 'Site Gamma Search']);
    expect(labels).toHaveLength(3);
  });

  it('falls back to the id when the name is missing', () => {
    const data = makeGridData([makeSite('site-1', 'Known')]);
    const labels = getGridSiteNames(
      'countries',
      ['grid-1'],
      {},
      { 'grid-1': ['site-1', 'site-unknown'] },
      data
    );
    expect(labels).toEqual(['Known', 'site-unknown']);
    expect(labels).toHaveLength(2);
  });

  it('deduplicates via resolveGridSitesForDownload, producing one label per unique id', () => {
    // Duplicate ids in raw selection — resolveGridSitesForDownload dedupes them
    const labels = getGridSiteNames(
      'cities',
      ['grid-1'],
      {},
      { 'grid-1': ['site-1', 'site-1', 'site-2'] },
      gridData
    );
    expect(labels).toEqual(['Site Alpha', 'Site Beta']);
    expect(labels).toHaveLength(2);
  });

  it('returns [] for non-grid tabs (sites, devices)', () => {
    expect(getGridSiteNames('sites', [], {}, {}, [])).toEqual([]);
    expect(getGridSiteNames('devices', [], {}, {}, [])).toEqual([]);
  });
});
