import {
  formatDeviceCategoryLabel,
  getDeviceCategories,
  getMonitorMetadata,
} from '../monitorMetadata';

describe('formatDeviceCategoryLabel', () => {
  it('returns null for null', () => {
    expect(formatDeviceCategoryLabel(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(formatDeviceCategoryLabel(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(formatDeviceCategoryLabel('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(formatDeviceCategoryLabel('   ')).toBeNull();
  });

  it('normalizes low_cost to Low Cost Sensor', () => {
    expect(formatDeviceCategoryLabel('low_cost')).toBe('Low Cost Sensor');
  });

  it('handles known override: airqo', () => {
    expect(formatDeviceCategoryLabel('airqo')).toBe('AirQo');
  });

  it('handles known override: bam', () => {
    expect(formatDeviceCategoryLabel('bam')).toBe('Reference Monitor');
  });

  it('handles known override: lowcost', () => {
    expect(formatDeviceCategoryLabel('lowcost')).toBe('Low Cost Sensor');
  });

  it('handles known override: low cost', () => {
    expect(formatDeviceCategoryLabel('low cost')).toBe('Low Cost Sensor');
  });

  it('title-cases unknown values', () => {
    expect(formatDeviceCategoryLabel('reference grade')).toBe(
      'Reference Grade'
    );
  });

  it('handles dash separators', () => {
    expect(formatDeviceCategoryLabel('high-cost')).toBe('High Cost');
  });
});

describe('getDeviceCategories', () => {
  it('returns undefined for null', () => {
    expect(getDeviceCategories(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(getDeviceCategories(undefined)).toBeUndefined();
  });

  it('returns from device_categories', () => {
    const cats = { ownership_category: 'AirQo' };
    expect(getDeviceCategories({ device_categories: cats })).toBe(cats);
  });

  it('falls back to deviceCategories', () => {
    const cats = { ownership_category: 'AirQo' };
    expect(getDeviceCategories({ deviceCategories: cats })).toBe(cats);
  });

  it('falls back to fullReadingData.device_categories', () => {
    const cats = { ownership_category: 'AirQo' };
    expect(
      getDeviceCategories({ fullReadingData: { device_categories: cats } })
    ).toBe(cats);
  });

  it('prefers device_categories over deviceCategories', () => {
    const primary = { ownership_category: 'A' };
    const secondary = { ownership_category: 'B' };
    expect(
      getDeviceCategories({
        device_categories: primary,
        deviceCategories: secondary,
      })
    ).toBe(primary);
  });
});

describe('getMonitorMetadata', () => {
  it('returns fallback provider when no reading', () => {
    const result = getMonitorMetadata(null);
    expect(result.provider).toBe('AirQo');
  });

  it('extracts provider from reading.provider', () => {
    const result = getMonitorMetadata({ provider: 'CustomProvider' });
    expect(result.provider).toBe('CustomProvider');
  });

  it('falls back through siteDetails.data_provider', () => {
    const result = getMonitorMetadata({
      siteDetails: { data_provider: 'SiteProvider' },
    });
    expect(result.provider).toBe('SiteProvider');
  });

  it('falls back to fullReadingData.siteDetails.data_provider', () => {
    const result = getMonitorMetadata({
      fullReadingData: { siteDetails: { data_provider: 'DeepProvider' } },
    });
    expect(result.provider).toBe('DeepProvider');
  });

  it('extracts ownership_category, primary_category, deployment_category', () => {
    const result = getMonitorMetadata({
      device_categories: {
        ownership_category: 'low_cost',
        primary_category: 'airqo',
        deployment_category: 'static',
      },
    });
    expect(result.ownershipCategory).toBe('Low Cost Sensor');
    expect(result.primaryCategory).toBe('AirQo');
    expect(result.deploymentCategory).toBe('Static');
  });

  it('uses ownershipCategory as provider when primary_category exists', () => {
    const result = getMonitorMetadata({
      device_categories: {
        ownership_category: 'Government',
        primary_category: 'bam',
      },
    });
    expect(result.provider).toBe('Government');
  });

  it('uses provider from reading when primary_category exists', () => {
    const result = getMonitorMetadata({
      provider: 'ReadingProvider',
      device_categories: {
        primary_category: 'bam',
      },
    });
    expect(result.provider).toBe('ReadingProvider');
  });
});
