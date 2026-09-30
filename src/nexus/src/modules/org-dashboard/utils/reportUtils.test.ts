import type { AnalyticsReport } from '@/shared/types/api';
import {
  formatReportValue,
  getReportDailySeries,
  getReportDiurnalSeries,
  getReportRequestRange,
  getReportSiteRows,
  getReportSummary,
  hasReportData,
} from './reportUtils';

const createReport = (
  overrides: Partial<AnalyticsReport> = {}
): AnalyticsReport => ({
  status: 'success',
  cohort_id: 'cohort-1',
  devices: {
    device_ids: ['device-1', 'device-2'],
    number_of_devices: 2,
  },
  period: {
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-02T23:59:59Z',
  },
  daily_mean_pm: [],
  datetime_mean_pm: [],
  diurnal: [],
  annual_pm: [],
  monthly_pm: [],
  pm_by_month_year: [],
  pm_by_month_name: [],
  site_monthly_mean_pm: [],
  site_annual_mean_pm: [],
  site_mean_pm: [],
  mean_pm_by_city: [],
  mean_pm_by_country: [],
  mean_pm_by_region: [],
  mean_pm_by_day_of_week: [],
  mean_pm_by_day_hour: [],
  ...overrides,
});

describe('organization report utilities', () => {
  it('normalizes the report timestamp format for chart rendering', () => {
    const report = createReport({
      datetime_mean_pm: [
        {
          timestamp: '2024-01-01 13:00 UTC',
          pm2_5_calibrated_value: 15,
        },
      ],
    });

    expect(getReportDailySeries(report, 'pm2_5')[0]?.time).toBe(
      '2024-01-01T13:00:00Z'
    );
  });

  it('sorts daily values and omits unavailable calibrated readings', () => {
    const report = createReport({
      daily_mean_pm: [
        {
          date: '2024-01-02T00:00:00',
          pm2_5_calibrated_value: 18,
          pm10_calibrated_value: null,
        },
        {
          date: '2024-01-01',
          pm2_5_calibrated_value: null,
          pm10_calibrated_value: 30,
        },
        {
          date: '2024-01-03',
          pm2_5_calibrated_value: 12,
          pm10_calibrated_value: 24,
        },
      ],
    });

    expect(getReportDailySeries(report, 'pm2_5')).toEqual([
      expect.objectContaining({ time: '2024-01-02T00:00:00Z', value: 18 }),
      expect.objectContaining({ time: '2024-01-03', value: 12 }),
    ]);
    expect(getReportDailySeries(report, 'pm10')).toEqual([
      expect.objectContaining({ time: '2024-01-01', value: 30 }),
      expect.objectContaining({ time: '2024-01-03', value: 24 }),
    ]);
  });

  it('builds a sorted diurnal series and site ranking', () => {
    const report = createReport({
      diurnal: [
        { hour: 13, pm2_5_calibrated_value: 20 },
        { hour: 2, pm2_5_calibrated_value: 31 },
        { hour: 7, pm2_5_calibrated_value: null },
      ],
      site_mean_pm: [
        {
          site_name: 'Makerere',
          pm2_5_calibrated_value: 22,
          site_latitude: 0.33,
          site_longitude: 32.57,
        },
        {
          site_name: 'Central',
          pm2_5_calibrated_value: 41,
        },
      ],
    });

    expect(
      getReportDiurnalSeries(report, 'pm2_5').map(row => row.time)
    ).toEqual(['02:00', '13:00']);
    expect(getReportSiteRows(report, 'pm2_5').map(row => row.name)).toEqual([
      'Central',
      'Makerere',
    ]);
  });

  it('calculates report coverage and calibrated summaries', () => {
    const report = createReport({
      daily_mean_pm: [
        {
          date: '2024-01-01',
          pm2_5_calibrated_value: 10,
          pm10_calibrated_value: 20,
        },
        {
          date: '2024-01-02',
          pm2_5_calibrated_value: 30,
          pm10_calibrated_value: 40,
        },
      ],
      site_mean_pm: [
        { site_name: 'Makerere', pm2_5_calibrated_value: 10 },
        { site_name: 'Central', pm2_5_calibrated_value: 20 },
      ],
    });

    expect(getReportSummary(report)).toEqual({
      averagePm25: 20,
      averagePm10: 30,
      peakPm25: 30,
      activeDays: 2,
      deviceCount: 2,
      siteCount: 2,
    });
    expect(hasReportData(report)).toBe(true);
    expect(hasReportData(createReport())).toBe(false);
  });

  it('counts active days only from ISO-looking day keys', () => {
    const report = createReport({
      daily_mean_pm: [
        { date: '2024-01-01T00:00:00', pm2_5_calibrated_value: 10 },
        { date: '2024-01-01 13:00 UTC', pm2_5_calibrated_value: 12 },
        // Non-ISO fallbacks must not inflate the count by a blind slice.
        { date: 'not-a-timestamp', pm2_5_calibrated_value: 20 },
        { date: '01/02/2024', pm2_5_calibrated_value: 22 },
      ],
    });

    expect(getReportSummary(report).activeDays).toBe(1);
    expect(getReportSummary(createReport()).activeDays).toBe(0);
  });

  it('formats values without inventing data', () => {
    expect(formatReportValue(null)).toBe('—');
    expect(formatReportValue(12.345)).toBe('12.3');
    expect(formatReportValue(123.45)).toBe('123');
  });
});

describe('getReportRequestRange', () => {
  it('keeps the selected local calendar dates as the UTC dates in the payload', () => {
    // Local getters make this independent of the machine timezone: the range
    // the picker shows (Jun 1 – Jun 27) must be the range the backend sees.
    // June is deliberately in the past so the future-clamp does not trim it.
    expect(
      getReportRequestRange({
        from: new Date(2026, 5, 1),
        to: new Date(2026, 5, 27),
      })
    ).toEqual({
      startDateTime: '2026-06-01T00:00:00.000Z',
      endDateTime: '2026-06-27T23:59:59.999Z',
    });
  });

  it('throws when either end of the range is missing or invalid', () => {
    expect(() =>
      getReportRequestRange({ from: undefined, to: new Date(2026, 8, 27) })
    ).toThrow(/valid from date/);
    expect(() =>
      getReportRequestRange({ from: new Date(2026, 8, 1), to: undefined })
    ).toThrow(/valid to date/);
    expect(() =>
      getReportRequestRange({
        from: new Date('not-a-date'),
        to: new Date(2026, 8, 27),
      })
    ).toThrow(/valid from date/);
    expect(() =>
      getReportRequestRange({
        from: new Date(2026, 8, 1),
        to: new Date('not-a-date'),
      })
    ).toThrow(/valid to date/);
  });

  describe('future-date clamping', () => {
    // 2026-09-28T01:00:00Z: local midnight for a UTC+3 (Kampala) viewer on
    // "Sep 28" is already 2026-09-28T00:00:00Z, which is in the future.
    const NOW = Date.parse('2026-09-28T01:00:00.000Z');
    let nowSpy: jest.SpyInstance<number, []>;

    beforeEach(() => {
      nowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterEach(() => {
      nowSpy.mockRestore();
    });

    it('clamps a UTC+ "today" start instead of sending a future timestamp', () => {
      const localToday = new Date(2026, 8, 28);
      const range = getReportRequestRange({ from: localToday, to: localToday });

      // Neither end may be in the future, whatever the machine timezone.
      expect(Date.parse(range.startDateTime)).toBeLessThanOrEqual(NOW);
      expect(Date.parse(range.endDateTime)).toBeLessThanOrEqual(NOW);
      expect(Date.parse(range.endDateTime)).toBeGreaterThan(
        Date.parse(range.startDateTime)
      );
    });

    it('keeps a past range untouched by the clamp', () => {
      expect(
        getReportRequestRange({
          from: new Date(2026, 8, 1),
          to: new Date(2026, 8, 27),
        })
      ).toEqual({
        startDateTime: '2026-09-01T00:00:00.000Z',
        endDateTime: '2026-09-27T23:59:59.999Z',
      });
    });

    it('clamps only the end when the range ends today', () => {
      const range = getReportRequestRange({
        from: new Date(2026, 8, 1),
        to: new Date(2026, 8, 28),
      });

      expect(range.startDateTime).toBe('2026-09-01T00:00:00.000Z');
      expect(Date.parse(range.endDateTime)).toBeLessThanOrEqual(NOW);
    });

    it('rejects a range that lies entirely in the future', () => {
      expect(() =>
        getReportRequestRange({
          from: new Date(2026, 9, 1),
          to: new Date(2026, 9, 30),
        })
      ).toThrow(/has not started yet/);
    });

    it('uses local midnight for a viewer selecting their local today', () => {
      // Pick an instant whose local date is unambiguously "today" for the
      // viewer, then select that same local day in the picker. The payload
      // must start at the viewer's local midnight (capped at now), not at the
      // UTC-day boundary, or a UTC+ viewer's range would collapse.
      const NOW = Date.parse('2026-09-27T22:00:00.000Z');
      const localNow = new Date(NOW);
      const localMidnight = new Date(localNow);
      localMidnight.setHours(0, 0, 0, 0);
      const expectedStart = new Date(
        Math.min(localMidnight.getTime(), NOW)
      ).toISOString();

      // Construct the picker's "today" from the same local calendar date.
      const pickerToday = new Date(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate()
      );

      const range = getReportRequestRange({
        from: pickerToday,
        to: pickerToday,
      });

      expect(range.startDateTime).toBe(expectedStart);
      expect(Date.parse(range.startDateTime)).toBeLessThanOrEqual(NOW);
      expect(Date.parse(range.endDateTime)).toBeGreaterThan(
        Date.parse(range.startDateTime)
      );
    });
  });
});
