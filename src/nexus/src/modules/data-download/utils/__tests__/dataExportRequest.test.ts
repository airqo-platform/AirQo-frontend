import {
  buildDataDownloadRequest,
  resolveGridSitesForDownload,
} from '../dataExportRequest';

const dateRange = {
  from: new Date('2026-01-02T12:00:00.000Z'),
  to: new Date('2026-01-03T12:00:00.000Z'),
};

const baseArgs = {
  dateRange,
  selectedSites: [],
  selectedSiteIds: [],
  selectedDeviceIds: [],
  selectedGridIds: [],
  selectedGridSites: {},
  selectedGridSiteIds: {},
  selectedPollutants: ['pm2_5'],
  dataType: 'raw',
  fileType: 'csv',
  frequency: 'daily',
  deviceCategory: 'lowcost' as const,
};

describe('buildDataDownloadRequest', () => {
  it('uses site IDs and no display-name selector for the sites tab', () => {
    const request = buildDataDownloadRequest({
      ...baseArgs,
      activeTab: 'sites',
      selectedSites: ['Displayed site name'],
      selectedSiteIds: ['site-1'],
    });

    expect(request).toMatchObject({ sites: ['site-1'] });
    expect(request.device_ids).toBeUndefined();
    expect(request.device_names).toBeUndefined();
  });

  it('uses complete device names when they match the selected devices', () => {
    const request = buildDataDownloadRequest({
      ...baseArgs,
      activeTab: 'devices',
      selectedDeviceIds: ['device-1', 'device-2'],
      selectedDeviceNames: ['AQ-1', 'AQ-2'],
    });

    expect(request.device_names).toEqual(['AQ-1', 'AQ-2']);
    expect(request.device_ids).toBeUndefined();
    expect(request.sites).toBeUndefined();
  });

  it('falls back to device IDs when names are incomplete', () => {
    const request = buildDataDownloadRequest({
      ...baseArgs,
      activeTab: 'devices',
      selectedDeviceIds: ['device-1', 'device-2'],
      selectedDeviceNames: ['AQ-1'],
    });

    expect(request.device_ids).toEqual(['device-1', 'device-2']);
    expect(request.device_names).toBeUndefined();
  });

  it('uses site IDs resolved from country/city grids', () => {
    const request = buildDataDownloadRequest({
      ...baseArgs,
      activeTab: 'countries',
      selectedGridIds: ['country-1'],
      selectedGridSites: { 'country-1': ['site-1', 'site-2'] },
      selectedGridSiteIds: {},
    });

    expect(request.sites).toEqual(['site-1', 'site-2']);
    expect(request.device_ids).toBeUndefined();
    expect(request.device_names).toBeUndefined();
  });

  it('honors an explicit empty custom grid selection instead of restoring defaults', () => {
    expect(
      resolveGridSitesForDownload(
        ['country-1'],
        { 'country-1': ['site-1'] },
        { 'country-1': [] }
      )
    ).toEqual([]);

    expect(() =>
      buildDataDownloadRequest({
        ...baseArgs,
        activeTab: 'cities',
        selectedGridIds: ['city-1'],
        selectedGridSites: { 'city-1': ['site-1'] },
        selectedGridSiteIds: { 'city-1': [] },
      })
    ).toThrow('At least one monitoring site');
  });
});
