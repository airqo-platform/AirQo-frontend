import type { NormalizedChartData } from '@/shared/components/charts/types';
import {
  buildDataKeyBySiteId,
  buildSiteLabels,
  buildSeriesLabels,
  enrichChartDataSiteIds,
} from '../chartLabels';

const makePoint = (
  overrides: Partial<NormalizedChartData> = {}
): NormalizedChartData => ({
  time: '2025-07-01',
  value: 10,
  site: 'Test Site',
  device_id: '',
  ...overrides,
});

describe('buildDataKeyBySiteId', () => {
  it('maps site_id → site key for points with both', () => {
    const data = [makePoint({ site_id: 'abc', site: 'Kampala' })];
    const result = buildDataKeyBySiteId(data);
    expect(result.get('abc')).toBe('Kampala');
  });

  it('ignores points with empty site_id', () => {
    const data = [makePoint({ site_id: '', site: 'Kampala' })];
    const result = buildDataKeyBySiteId(data);
    expect(result.size).toBe(0);
  });
});

describe('buildSiteLabels', () => {
  it('prefers siteNames Map over chart data site', () => {
    const data = [makePoint({ site_id: 'abc', site: 'D3 Name' })];
    const siteNames = new Map([['abc', 'Sidecar Name']]);
    const labels = buildSiteLabels(data, siteNames);
    expect(labels.abc).toBe('Sidecar Name');
  });

  it('falls back to chart data site when siteNames has no entry', () => {
    const data = [makePoint({ site_id: 'abc', site: 'D3 Name' })];
    const siteNames = new Map<string, string>();
    const labels = buildSiteLabels(data, siteNames);
    expect(labels.abc).toBe('D3 Name');
  });

  it('skips points without site_id', () => {
    const data = [makePoint({ site_id: '', site: 'Test' })];
    const siteNames = new Map([['abc', 'Name']]);
    const labels = buildSiteLabels(data, siteNames);
    expect(Object.keys(labels)).toHaveLength(0);
  });
});

describe('buildSeriesLabels', () => {
  it('maps site_key → siteLabels value', () => {
    const data = [makePoint({ site_id: 'abc', site: 'Kampala' })];
    const siteLabels = { abc: 'Kampala Monitor' };
    const labels = buildSeriesLabels(data, siteLabels);
    expect(labels.Kampala).toBe('Kampala Monitor');
  });

  it('uses d3 name as fallback when siteLabels has no entry', () => {
    const data = [makePoint({ site_id: 'abc', site: 'D3 Name' })];
    const labels = buildSeriesLabels(data, {});
    expect(labels['D3 Name']).toBe('D3 Name');
  });

  it('sets "value" label for single-series charts', () => {
    const data = [makePoint({ site_id: 'abc', site: 'Kampala' })];
    const siteLabels = { abc: 'Kampala Monitor' };
    const labels = buildSeriesLabels(data, siteLabels);
    expect(labels.value).toBe('Kampala Monitor');
  });
});

describe('enrichChartDataSiteIds', () => {
  const siteNames = new Map([
    ['id-1', 'Site Alpha'],
    ['id-2', 'Site Beta'],
  ]);

  it('fills site_id from exact name match', () => {
    const data = [makePoint({ site: 'Site Alpha', site_id: '' })];
    const result = enrichChartDataSiteIds(data, siteNames);
    expect(result[0].site_id).toBe('id-1');
    expect(result[0].site).toBe('Site Alpha');
  });

  it('canonicalises site name when site_id already exists', () => {
    const data = [makePoint({ site: 'Old Name', site_id: 'id-1' })];
    const result = enrichChartDataSiteIds(data, siteNames);
    expect(result[0].site).toBe('Site Alpha');
    expect(result[0].site_id).toBe('id-1');
  });

  it('does not overwrite an existing site_id with a name match', () => {
    const data = [makePoint({ site: 'Site Beta', site_id: 'id-1' })];
    const result = enrichChartDataSiteIds(data, siteNames);
    // site_id stays 'id-1', not overwritten to 'id-2'
    expect(result[0].site_id).toBe('id-1');
  });

  it('skips unknown/placeholder names', () => {
    const data = [
      makePoint({ site: 'Unknown Location', site_id: '' }),
      makePoint({ site: 'unknown location', site_id: '' }),
    ];
    const result = enrichChartDataSiteIds(data, siteNames);
    expect(result[0].site_id).toBe('');
    expect(result[1].site_id).toBe('');
  });

  it('returns new array (no mutation)', () => {
    const data = [makePoint({ site: 'Site Alpha', site_id: '' })];
    const result = enrichChartDataSiteIds(data, siteNames);
    expect(result).not.toBe(data);
    expect(data[0].site_id).toBe('');
  });

  it('handles empty chartData', () => {
    expect(enrichChartDataSiteIds([], siteNames)).toEqual([]);
  });

  it('handles empty siteNames', () => {
    const data = [makePoint({ site: 'Site Alpha', site_id: '' })];
    const result = enrichChartDataSiteIds(data, new Map());
    expect(result[0].site_id).toBe('');
  });

  it('case-sensitive: does not match "site alpha" to "Site Alpha"', () => {
    const data = [makePoint({ site: 'site alpha', site_id: '' })];
    const result = enrichChartDataSiteIds(data, siteNames);
    expect(result[0].site_id).toBe('');
  });

  it('skips placeholder names in the siteNames map (no reverse entry created)', () => {
    const namesWithUnknown = new Map([
      ['id-x', 'Unknown location'],
      ['id-1', 'Site Alpha'],
    ]);
    const data = [makePoint({ site: 'Unknown location', site_id: '' })];
    const result = enrichChartDataSiteIds(data, namesWithUnknown);
    // 'Unknown location' should not have a reverse entry
    expect(result[0].site_id).toBe('');
  });

  it('first-id-wins when two ids share the same name', () => {
    const namesDupe = new Map([
      ['id-first', 'Dupe Name'],
      ['id-second', 'Dupe Name'],
    ]);
    const data = [makePoint({ site: 'Dupe Name', site_id: '' })];
    const result = enrichChartDataSiteIds(data, namesDupe);
    expect(result[0].site_id).toBe('id-first');
  });
});
