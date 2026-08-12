import {
  persistedConfigToDraft,
  draftToPersistedConfig,
  deriveRangeFromDays,
  computeDaysFromRange,
  formatChartRangeLabel,
  normalizePollutant,
  normalizeFrequency,
  normalizeExplorerChartType,
  readChartSidecar,
  writeChartSidecar,
  removeChartSidecar,
  DEFAULT_CHART_SIDECAR,
} from '../chartConfig';
import type { GroupChartConfig } from '@/shared/types/api';

const PERSISTED: GroupChartConfig = {
  _id: 'chart-1',
  fieldId: 1,
  title: 'PM2.5 Levels',
  chartType: 'Line',
  days: 30,
  results: 100,
  showLegend: true,
  showGrid: false,
  showTooltip: true,
  color: '#d62020',
  referenceLines: [{ value: 15, label: 'WHO', color: '#FF0000', style: 'dashed' }],
  site_ids: ['site-a', 'site-b'],
  device_ids: [],
};

const RANGE = deriveRangeFromDays(7);

describe('chartConfig utils', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('normalize helpers', () => {
    it('normalizes pollutant values with fallback', () => {
      expect(normalizePollutant('pm2_5')).toBe('pm2_5');
      expect(normalizePollutant('PM10')).toBe('pm10');
      expect(normalizePollutant('pm2.5')).toBe('pm2_5');
      expect(normalizePollutant('no2')).toBe('pm2_5');
      expect(normalizePollutant(undefined)).toBe('pm2_5');
    });

    it('normalizes frequency values with fallback', () => {
      expect(normalizeFrequency('hourly')).toBe('hourly');
      expect(normalizeFrequency('Weekly')).toBe('weekly');
      expect(normalizeFrequency('raw')).toBe('daily');
      expect(normalizeFrequency(undefined)).toBe('daily');
    });

    it('normalizes chart types with fallback', () => {
      expect(normalizeExplorerChartType('Line')).toBe('Line');
      expect(normalizeExplorerChartType('area')).toBe('Area');
      expect(normalizeExplorerChartType('Column')).toBe('Bar');
      expect(normalizeExplorerChartType('pie')).toBe('Line');
    });
  });

  describe('range helpers', () => {
    it('derives a range of the configured number of days', () => {
      const { startDate, endDate } = deriveRangeFromDays(7);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = (end.getTime() - start.getTime()) / 86400000;

      expect(diffDays).toBeGreaterThanOrEqual(7);
      expect(diffDays).toBeLessThan(8);
      expect(end.getHours()).toBe(23);
    });

    it('computes days from a range with a 1-day minimum', () => {
      expect(
        computeDaysFromRange('2026-08-01T00:00:00.000Z', '2026-08-11T23:59:59.000Z')
      ).toBe(11);
      expect(
        computeDaysFromRange('2026-08-01T00:00:00.000Z', '2026-08-01T12:00:00.000Z')
      ).toBe(1);
      expect(computeDaysFromRange('not-a-date', '2026-08-11')).toBe(7);
    });

    it('formats a compact range label', () => {
      expect(
        formatChartRangeLabel('2026-08-04T00:00:00.000Z', '2026-08-11T23:59:59.000Z')
      ).toContain('Aug 4');
      expect(formatChartRangeLabel('', '')).toBe('');
    });
  });

  describe('persistedConfigToDraft', () => {
    it('maps persisted config + sidecar into a draft', () => {
      const draft = persistedConfigToDraft(PERSISTED, {
        ...DEFAULT_CHART_SIDECAR,
        subtitle: 'Weekly average',
        pollutant: 'pm10',
        frequency: 'weekly',
        color: null,
        ...RANGE,
      });

      expect(draft).toMatchObject({
        id: 'chart-1',
        title: 'PM2.5 Levels',
        subtitle: 'Weekly average',
        chartType: 'Line',
        pollutant: 'pm10',
        frequency: 'weekly',
        startDate: RANGE.startDate,
        endDate: RANGE.endDate,
        siteIds: ['site-a', 'site-b'],
        deviceIds: [],
        color: null,
        showLegend: true,
        showGrid: false,
        showTooltip: true,
      });
      expect(draft.referenceLines).toHaveLength(1);
    });

    it('derives the range from days when the sidecar has no custom range', () => {
      const draft = persistedConfigToDraft(PERSISTED);

      expect(draft.startDate).toBeTruthy();
      expect(draft.endDate).toBeTruthy();
      const diffDays =
        (new Date(draft.endDate).getTime() - new Date(draft.startDate).getTime()) /
        86400000;
      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThan(31);
    });

    it('applies defaults for missing sidecar and fields', () => {
      const draft = persistedConfigToDraft({
        fieldId: 2,
        title: '',
        chartType: '',
      });

      expect(draft.title).toBe('Untitled chart');
      expect(draft.pollutant).toBe('pm2_5');
      expect(draft.frequency).toBe('daily');
      expect(draft.chartType).toBe('Line');
      expect(draft.color).toBeNull();
      expect(draft.siteIds).toEqual([]);
    });

    it('falls back to the persisted color for legacy drafts', () => {
      const draft = persistedConfigToDraft(PERSISTED);
      expect(draft.color).toBe('#d62020');
    });
  });

  describe('draftToPersistedConfig', () => {
    it('produces the persistable fields with a computed day count', () => {
      const draft = persistedConfigToDraft(PERSISTED, {
        ...DEFAULT_CHART_SIDECAR,
        color: '#10B981',
        ...RANGE,
      });
      const config = draftToPersistedConfig(draft, 3);

      expect(config).toMatchObject({
        fieldId: 3,
        title: 'PM2.5 Levels',
        chartType: 'Line',
        days: 7,
        showLegend: true,
        showGrid: false,
        showTooltip: true,
        color: '#10B981',
      });
      expect(config.referenceLines).toHaveLength(1);
    });

    it('omits the color when the draft uses the chart default', () => {
      const draft = persistedConfigToDraft(PERSISTED, {
        ...DEFAULT_CHART_SIDECAR,
        color: null,
        ...RANGE,
      });
      const config = draftToPersistedConfig(draft);

      expect('color' in config).toBe(false);
    });

    it('never emits an empty title', () => {
      const draft = persistedConfigToDraft({
        fieldId: 1,
        title: '   ',
        chartType: 'Line',
      });
      expect(draftToPersistedConfig(draft).title).toBe('Untitled chart');
    });
  });

  describe('sidecar storage', () => {
    it('round-trips sidecar data per group + chart', () => {
      writeChartSidecar('group-1', 'chart-a', {
        subtitle: 'My subtitle',
        pollutant: 'pm10',
        color: '#145DFF',
        ...RANGE,
      });

      expect(readChartSidecar('group-1', 'chart-a')).toEqual({
        subtitle: 'My subtitle',
        pollutant: 'pm10',
        frequency: 'daily',
        color: '#145DFF',
        startDate: RANGE.startDate,
        endDate: RANGE.endDate,
      });

      // Other charts/groups keep defaults (no stored entry → color unset)
      expect(readChartSidecar('group-1', 'chart-b')).toEqual({
        ...DEFAULT_CHART_SIDECAR,
        color: undefined,
      });
      expect(readChartSidecar('group-2', 'chart-a')).toEqual({
        ...DEFAULT_CHART_SIDECAR,
        color: undefined,
      });
    });

    it('merges partial writes and removes cleanly', () => {
      writeChartSidecar('group-1', 'chart-a', { subtitle: 'x' });
      writeChartSidecar('group-1', 'chart-a', { frequency: 'weekly' });

      expect(readChartSidecar('group-1', 'chart-a')).toEqual({
        subtitle: 'x',
        pollutant: 'pm2_5',
        frequency: 'weekly',
        color: null,
        startDate: '',
        endDate: '',
      });

      removeChartSidecar('group-1', 'chart-a');
      expect(readChartSidecar('group-1', 'chart-a')).toEqual({
        ...DEFAULT_CHART_SIDECAR,
        color: undefined,
      });
    });
  });
});
