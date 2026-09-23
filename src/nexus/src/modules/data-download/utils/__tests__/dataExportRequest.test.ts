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
    expect(request.metaDataFields).toContain('site_id');
  });

  it('uses device IDs even when human-readable names are available', () => {
    const request = buildDataDownloadRequest({
      ...baseArgs,
      activeTab: 'devices',
      selectedDeviceIds: ['device-1', 'device-2'],
      selectedDeviceNames: ['AQ-1', 'AQ-2'],
    });

    // The API resolves device_names against device IDs, so human-readable
    // labels must never be sent as that selector.
    expect(request.device_ids).toEqual(['device-1', 'device-2']);
    expect(request.device_names).toBeUndefined();
    expect(request.sites).toBeUndefined();
  });

  it('uses device IDs when names are incomplete', () => {
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

  it('keeps metadata and weather fields enabled for the documented export shape', () => {
    const request = buildDataDownloadRequest({
      ...baseArgs,
      activeTab: 'sites',
      selectedSiteIds: ['site-1'],
    });

    expect(request.minimum).toBe(false);
    expect(request.metaDataFields).toEqual([
      'latitude',
      'longitude',
      'site_id',
    ]);
    expect(request.weatherFields).toEqual(['temperature', 'humidity']);
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
