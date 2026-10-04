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

import {
  buildGridMetadataRows,
  buildGridLocationLookup,
} from '../useDataExportActions';
import { TableItem } from '../../types/dataExportTypes';

const OBJECT_ID = '65e98e11528c9f00133444f8';
const OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

const expectNotAnId = (value: unknown) => {
  expect(typeof value).toBe('string');
  expect(value).not.toBe(OBJECT_ID);
  expect(value).not.toMatch(OBJECT_ID_RE);
};

describe('buildGridMetadataRows', () => {
  const selectedGridSites: Record<string, string[]> = {};
  const selectedGridSiteIds: Record<string, string[]> = {
    'grid-1': ['site-1'],
  };

  it('never leaks a grid ObjectId into grid_name / city_name / country_name', () => {
    const grid = { _id: OBJECT_ID }; // no human name at all

    const cityRows = buildGridMetadataRows(
      'grid-1',
      grid,
      selectedGridSites,
      selectedGridSiteIds,
      'city'
    );
    expect(cityRows).toHaveLength(1);
    expect(cityRows[0].grid_name).toBe('Unknown location');
    expect(cityRows[0].city_name).toBe('Unknown location');
    expectNotAnId(cityRows[0].grid_name);
    expectNotAnId(cityRows[0].city_name);

    const countryRows = buildGridMetadataRows(
      'grid-1',
      grid,
      selectedGridSites,
      selectedGridSiteIds,
      'country'
    );
    expect(countryRows).toHaveLength(1);
    expect(countryRows[0].grid_name).toBe('Unknown location');
    expect(countryRows[0].country_name).toBe('Unknown location');
    expectNotAnId(countryRows[0].grid_name);
    expectNotAnId(countryRows[0].country_name);
  });

  it('never uses gridId as a name fallback', () => {
    const rows = buildGridMetadataRows(
      OBJECT_ID,
      { _id: OBJECT_ID },
      {},
      { [OBJECT_ID]: ['site-1'] },
      'city'
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].grid_name).toBe('Unknown location');
    expect(rows[0].city_name).toBe('Unknown location');
    expectNotAnId(rows[0].grid_name);
    expectNotAnId(rows[0].city_name);
  });

  it('sanitizes a grid whose name is itself a 24-hex ObjectId', () => {
    const rows = buildGridMetadataRows(
      'grid-1',
      { _id: 'grid-1', name: OBJECT_ID },
      selectedGridSites,
      selectedGridSiteIds,
      'city'
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].grid_name).toBe('Unknown location');
    expect(rows[0].city_name).toBe('Unknown location');
    expectNotAnId(rows[0].grid_name);
    expectNotAnId(rows[0].city_name);
  });

  it('keeps a real human grid name and never copies grid_id into name fields', () => {
    const rows = buildGridMetadataRows(
      'grid-1',
      { _id: 'grid-1', name: 'Kampala' },
      selectedGridSites,
      selectedGridSiteIds,
      'city'
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].grid_name).toBe('Kampala');
    expect(rows[0].city_name).toBe('Kampala');
    // grid_id stays an internal identifier on its own key
    expect(rows[0].grid_id).toBe('grid-1');
    expect(rows[0].grid_name).not.toBe('grid-1');
    expect(rows[0].city_name).not.toBe('grid-1');
  });

  it('sanitizes grid names on rows built from populated site entries too', () => {
    const rows = buildGridMetadataRows(
      'grid-1',
      { _id: OBJECT_ID, sites: [{ _id: 'site-1', name: 'Site Alpha' }] },
      selectedGridSites,
      selectedGridSiteIds,
      'city'
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].grid_name).toBe('Unknown location');
    expect(rows[0].city_name).toBe('Unknown location');
    expect(rows[0].site_name).toBe('Site Alpha');
    expectNotAnId(rows[0].grid_name);
    expectNotAnId(rows[0].city_name);
  });
});

describe('buildGridLocationLookup', () => {
  const makeGridData = (sites: Record<string, unknown>[]): TableItem[] => [
    { id: 'grid-1', _id: 'grid-1', sites } as unknown as TableItem,
  ];

  it('does not register a site ID as a name, but still maps by ID', () => {
    const lookup = buildGridLocationLookup(
      makeGridData([{ _id: 'site-1' }]), // site with no name fields
      ['grid-1'],
      {},
      { 'grid-1': ['site-1'] }
    );

    const byId = lookup.bySiteId.get('site-1');
    expect(byId).toBeDefined();
    expect(byId?.siteId).toBe('site-1');
    expect(byId?.siteName).toBe('Unknown location');
    expectNotAnId(byId?.siteName);

    // The site ID must never be usable as a lookup name…
    expect(lookup.bySiteName.has('site-1')).toBe(false);
    // …and the shared placeholder must not collide across sites either.
    expect(lookup.bySiteName.has('unknown location')).toBe(false);
    expect(lookup.bySiteName.size).toBe(0);
  });

  it('keeps placeholder names from colliding across multiple unnamed sites', () => {
    const lookup = buildGridLocationLookup(
      makeGridData([{ _id: 'site-1' }, { _id: 'site-2' }]),
      ['grid-1'],
      {},
      { 'grid-1': ['site-1', 'site-2'] }
    );

    expect(lookup.bySiteId.get('site-1')?.siteName).toBe('Unknown location');
    expect(lookup.bySiteId.get('site-2')?.siteName).toBe('Unknown location');
    expect(lookup.bySiteName.size).toBe(0);
  });

  it('registers real (sanitized) site names and never leaks the grid ID', () => {
    const lookup = buildGridLocationLookup(
      makeGridData([
        { _id: 'site-1', name: 'Site Alpha' },
        { _id: 'site-2', name: OBJECT_ID }, // name that is an ObjectId
      ]),
      ['grid-1'],
      {},
      { 'grid-1': ['site-1', 'site-2'] }
    );

    expect(lookup.bySiteName.get('site alpha')?.siteId).toBe('site-1');
    expect(lookup.bySiteName.has(OBJECT_ID)).toBe(false);
    expect(lookup.bySiteName.has('site-2')).toBe(false);
    expect(lookup.bySiteId.get('site-2')?.siteName).toBe('Unknown location');
    expectNotAnId(lookup.bySiteId.get('site-2')?.siteName);

    // Grid with no human name → locationName is the placeholder, not the ID.
    expect(lookup.bySiteId.get('site-1')?.locationName).toBe(
      'Unknown location'
    );
    expect(lookup.bySiteName.get('site alpha')?.locationName).toBe(
      'Unknown location'
    );
  });
});
