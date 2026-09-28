import {
  buildReportWindows,
  countWindowDays,
  getWindowDateParts,
  mergeReportWindows,
  mergeUnavailablePeriods,
  splitReportWindow,
} from '../utils/reportWindows';
import type { AnalyticsReport, AnalyticsReportPeriod } from '../../types/api';

const makeReport = (
  overrides: Partial<AnalyticsReport> = {}
): AnalyticsReport => ({
  status: 'success',
  cohort_id: 'cohort-1',
  devices: { device_ids: [], number_of_devices: 0 },
  period: { startTime: '', endTime: '' },
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

describe('buildReportWindows', () => {
  it('splits a 60-day range into three consecutive 27-date windows', () => {
    // Jan 1 → Mar 1, 2026 is 60 UTC calendar dates (31 + 28 + 1).
    const windows = buildReportWindows({
      cohort_id: 'cohort-1',
      start_time: '2026-01-01T00:00:00.000Z',
      end_time: '2026-03-01T23:59:59.999Z',
    });

    expect(windows).toEqual([
      {
        cohort_id: 'cohort-1',
        start_time: '2026-01-01T00:00:00.000Z',
        end_time: '2026-01-27T23:59:59.999Z',
      },
      {
        cohort_id: 'cohort-1',
        start_time: '2026-01-28T00:00:00.000Z',
        end_time: '2026-02-23T23:59:59.999Z',
      },
      {
        cohort_id: 'cohort-1',
        start_time: '2026-02-24T00:00:00.000Z',
        end_time: '2026-03-01T23:59:59.999Z',
      },
    ]);
  });

  it('keeps a range of 27 or fewer dates as a single unchanged window', () => {
    const request = {
      cohort_id: 'cohort-1',
      start_time: '2026-09-01T00:00:00.000Z',
      end_time: '2026-09-27T23:59:59.999Z',
    };

    expect(buildReportWindows(request)).toEqual([request]);
  });

  it('ends the last window exactly at the requested end', () => {
    const windows = buildReportWindows({
      cohort_id: 'cohort-1',
      start_time: '2026-01-01T00:00:00.000Z',
      end_time: '2026-01-29T12:00:00Z',
    });

    expect(windows).toHaveLength(2);
    expect(windows[1].end_time).toBe('2026-01-29T12:00:00Z');
    expect(windows[0].end_time).toBe('2026-01-27T23:59:59.999Z');
    expect(windows[1].start_time).toBe('2026-01-28T00:00:00.000Z');
  });
});

describe('mergeReportWindows', () => {
  const request = {
    cohort_id: 'cohort-1',
    start_time: '2026-01-01T00:00:00.000Z',
    end_time: '2026-02-23T23:59:59.999Z',
  };

  it('merges daily rows with dedupe and ascending sort, averages grouped rows and takes the device maximum', () => {
    const firstWindow = makeReport({
      daily_mean_pm: [
        { date: '2026-01-02', pm2_5_calibrated_value: 12 },
        { date: '2026-01-01', pm2_5_calibrated_value: 10 },
      ],
      datetime_mean_pm: [
        { date: '2026-01-02T00:00:00Z', hour: 1, pm2_5_calibrated_value: 12 },
      ],
      site_mean_pm: [
        {
          site_name: 'Site A',
          site_latitude: 1.5,
          site_longitude: 2.5,
          pm2_5_calibrated_value: 10,
          pm10_calibrated_value: 20,
        },
      ],
      diurnal: [{ hour: 8, pm2_5_calibrated_value: 10 }],
      devices: {
        device_ids: ['device-1', 'device-2'],
        number_of_devices: 2,
        'cohort name': ['Cohort One'],
      },
    });
    const secondWindow = makeReport({
      daily_mean_pm: [
        // Overlapping date: the first occurrence wins.
        { date: '2026-01-02', pm2_5_calibrated_value: 99 },
        { date: '2026-01-28', pm2_5_calibrated_value: 14 },
      ],
      datetime_mean_pm: [
        { date: '2026-01-28T00:00:00Z', hour: 0, pm2_5_calibrated_value: 14 },
      ],
      site_mean_pm: [
        {
          site_name: 'Site A',
          site_latitude: 9.9,
          site_longitude: 9.9,
          pm2_5_calibrated_value: 30,
          pm10_calibrated_value: 40,
        },
      ],
      diurnal: [{ hour: 8, pm2_5_calibrated_value: 20 }],
      devices: {
        device_ids: ['device-2', 'device-3'],
        number_of_devices: 1,
        'cohort name': ['Cohort One'],
      },
    });

    const merged = mergeReportWindows([firstWindow, secondWindow], request);

    expect(merged.status).toBe('success');
    expect(merged.cohort_id).toBe('cohort-1');
    expect(merged.period).toEqual({
      startTime: '2026-01-01T00:00:00.000Z',
      endTime: '2026-02-23T23:59:59.999Z',
    });

    expect(merged.daily_mean_pm.map(row => row.date)).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-28',
    ]);
    // The duplicate 2026-01-02 keeps the first window's value.
    expect(merged.daily_mean_pm[1].pm2_5_calibrated_value).toBe(12);

    expect(merged.datetime_mean_pm).toHaveLength(2);

    expect(merged.site_mean_pm).toEqual([
      {
        site_name: 'Site A',
        site_latitude: 1.5,
        site_longitude: 2.5,
        pm2_5_calibrated_value: 20,
        pm10_calibrated_value: 30,
      },
    ]);

    expect(merged.diurnal).toEqual([{ hour: 8, pm2_5_calibrated_value: 15 }]);

    expect(merged.devices).toEqual({
      device_ids: ['device-1', 'device-2', 'device-3'],
      number_of_devices: 2,
      'cohort name': ['Cohort One'],
    });

    // Data exists, so no no-data message is synthesized.
    expect(merged.message).toBeUndefined();
  });

  it("weights site and diurnal means by each window's day count", () => {
    // Adaptive splitting produces uneven windows: after a rejected month is
    // halved, a 1-day leaf must not count as much as a 26-day window.
    const oneDay = makeReport({
      period: {
        startTime: '2026-03-01T00:00:00.000Z',
        endTime: '2026-03-01T23:59:59.999Z',
      },
      site_mean_pm: [
        {
          site_name: 'Site A',
          pm2_5_calibrated_value: 100,
          pm10_calibrated_value: 0,
        },
      ],
      diurnal: [{ hour: 8, pm2_5_calibrated_value: 100 }],
    });
    const twentySixDays = makeReport({
      period: {
        startTime: '2026-01-01T00:00:00.000Z',
        endTime: '2026-01-26T23:59:59.999Z',
      },
      site_mean_pm: [
        {
          site_name: 'Site A',
          pm2_5_calibrated_value: 10,
          pm10_calibrated_value: 0,
        },
      ],
      diurnal: [{ hour: 8, pm2_5_calibrated_value: 10 }],
    });

    const merged = mergeReportWindows([oneDay, twentySixDays], {
      cohort_id: 'cohort-1',
      start_time: '2026-01-01T00:00:00.000Z',
      end_time: '2026-03-01T23:59:59.999Z',
    });

    // Day-weighted: (100*1 + 10*26) / 27 = 13.33…, not the simple mean of 55.
    expect(merged.site_mean_pm).toHaveLength(1);
    const siteValue = Number(merged.site_mean_pm[0].pm2_5_calibrated_value);
    expect(siteValue).toBeCloseTo((100 * 1 + 10 * 26) / 27, 5);
    expect(siteValue).toBeLessThan(20);

    const diurnalValue = Number(merged.diurnal[0].pm2_5_calibrated_value);
    expect(diurnalValue).toBeCloseTo((100 * 1 + 10 * 26) / 27, 5);
  });

  it('synthesizes the backend no-data message when every window is empty', () => {
    const merged = mergeReportWindows(
      [
        makeReport({
          message:
            'No data available for cohort cohort-1 for the selected period (2026-01-01 to 2026-01-27).',
        }),
        makeReport(),
      ],
      request
    );

    expect(merged.daily_mean_pm).toEqual([]);
    expect(merged.datetime_mean_pm).toEqual([]);
    expect(merged.message).toBe(
      'No data available for cohort cohort-1 for the selected period (2026-01-01 to 2026-02-23).'
    );
  });

  it('attaches unavailablePeriods to the merged report when provided', () => {
    const unavailable: AnalyticsReportPeriod[] = [
      {
        startTime: '2026-08-01T00:00:00.000Z',
        endTime: '2026-08-15T23:59:59.999Z',
      },
    ];
    const merged = mergeReportWindows([makeReport()], request, unavailable);

    expect(merged.unavailablePeriods).toEqual(unavailable);
  });

  it('omits unavailablePeriods when none are passed', () => {
    const merged = mergeReportWindows([makeReport()], request);
    expect(merged.unavailablePeriods).toBeUndefined();
  });
});

describe('getWindowDateParts and countWindowDays', () => {
  const window = {
    cohort_id: 'cohort-1',
    start_time: '2026-07-01T00:00:00.000Z',
    end_time: '2026-07-10T23:59:59.999Z',
  };

  it('extracts UTC date parts', () => {
    expect(getWindowDateParts(window)).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
    });
  });

  it('counts inclusive UTC calendar dates', () => {
    expect(countWindowDays(window)).toBe(10);
  });

  it('counts a 1-day window as 1', () => {
    expect(
      countWindowDays({
        cohort_id: 'cohort-1',
        start_time: '2026-07-01T00:00:00.000Z',
        end_time: '2026-07-01T23:59:59.999Z',
      })
    ).toBe(1);
  });
});

describe('splitReportWindow', () => {
  it('splits at the month boundary when the window crosses two months', () => {
    const parts = splitReportWindow({
      cohort_id: 'cohort-1',
      start_time: '2026-06-28T00:00:00.000Z',
      end_time: '2026-07-03T23:59:59.999Z',
    });

    expect(parts).not.toBeNull();
    const [first, second] = parts!;
    // First part ends on the last day of June (Jun 30).
    expect(first.start_time).toBe('2026-06-28T00:00:00.000Z');
    expect(first.end_time).toBe('2026-06-30T23:59:59.999Z');
    // Second part starts on the first day of July.
    expect(second.start_time).toBe('2026-07-01T00:00:00.000Z');
    expect(second.end_time).toBe('2026-07-03T23:59:59.999Z');
  });

  it('splits at the midpoint for a single-month window', () => {
    const parts = splitReportWindow({
      cohort_id: 'cohort-1',
      start_time: '2026-07-01T00:00:00.000Z',
      end_time: '2026-07-10T23:59:59.999Z',
    });

    expect(parts).not.toBeNull();
    const [first, second] = parts!;
    // 10 days → floor(9/2) = 4 → split at day 5 (Jul 5). First part: Jul 1–5.
    expect(first.start_time).toBe('2026-07-01T00:00:00.000Z');
    expect(first.end_time).toBe('2026-07-05T23:59:59.999Z');
    expect(second.start_time).toBe('2026-07-06T00:00:00.000Z');
    expect(second.end_time).toBe('2026-07-10T23:59:59.999Z');
  });

  it('returns null for a 1-day window (cannot split further)', () => {
    expect(
      splitReportWindow({
        cohort_id: 'cohort-1',
        start_time: '2026-08-05T00:00:00.000Z',
        end_time: '2026-08-05T23:59:59.999Z',
      })
    ).toBeNull();
  });

  it('preserves cohort_id through the split', () => {
    const parts = splitReportWindow({
      cohort_id: 'cohort-42',
      start_time: '2026-07-01T00:00:00.000Z',
      end_time: '2026-07-04T23:59:59.999Z',
    });
    expect(parts).not.toBeNull();
    expect(parts![0].cohort_id).toBe('cohort-42');
    expect(parts![1].cohort_id).toBe('cohort-42');
  });

  it('falls back to the midpoint when the start-month residual is 1 day', () => {
    // Aug 31 → Sep 10: a month-boundary split would put a lone Aug 31 in the
    // first part, so the balanced midpoint is used instead.
    const parts = splitReportWindow({
      cohort_id: 'cohort-1',
      start_time: '2026-08-31T00:00:00.000Z',
      end_time: '2026-09-10T23:59:59.999Z',
    });

    expect(parts).not.toBeNull();
    const [first, second] = parts!;
    // 11 days → floor(10/2) = 5 → split at Sep 5, not at the Aug/Sep edge.
    expect(first.start_time).toBe('2026-08-31T00:00:00.000Z');
    expect(first.end_time).toBe('2026-09-05T23:59:59.999Z');
    expect(second.start_time).toBe('2026-09-06T00:00:00.000Z');
    expect(second.end_time).toBe('2026-09-10T23:59:59.999Z');
    // Both parts stay strictly smaller than the input, so splitting terminates.
    expect(countWindowDays(first)).toBe(6);
    expect(countWindowDays(second)).toBe(5);
  });
});

describe('mergeUnavailablePeriods', () => {
  it('sorts and coalesces adjacent and overlapping periods', () => {
    const periods: AnalyticsReportPeriod[] = [
      {
        startTime: '2026-08-10T00:00:00.000Z',
        endTime: '2026-08-10T23:59:59.999Z',
      },
      {
        startTime: '2026-07-15T00:00:00.000Z',
        endTime: '2026-07-15T23:59:59.999Z',
      },
      {
        startTime: '2026-08-02T00:00:00.000Z',
        endTime: '2026-08-02T23:59:59.999Z',
      },
      {
        startTime: '2026-08-01T00:00:00.000Z',
        endTime: '2026-08-01T23:59:59.999Z',
      },
      // Overlaps nothing yet, but is adjacent to the Aug 10 entry.
      {
        startTime: '2026-08-09T12:00:00.000Z',
        endTime: '2026-08-09T23:59:59.999Z',
      },
    ];

    expect(mergeUnavailablePeriods(periods)).toEqual([
      {
        startTime: '2026-07-15T00:00:00.000Z',
        endTime: '2026-07-15T23:59:59.999Z',
      },
      {
        startTime: '2026-08-01T00:00:00.000Z',
        endTime: '2026-08-02T23:59:59.999Z',
      },
      {
        startTime: '2026-08-09T12:00:00.000Z',
        endTime: '2026-08-10T23:59:59.999Z',
      },
    ]);
    // Pure helper: the input array and its entries are left untouched.
    expect(periods).toHaveLength(5);
    expect(periods[0].endTime).toBe('2026-08-10T23:59:59.999Z');
  });

  it('keeps the widest boundaries when a period is nested in another', () => {
    expect(
      mergeUnavailablePeriods([
        {
          startTime: '2026-08-05T00:00:00.000Z',
          endTime: '2026-08-20T23:59:59.999Z',
        },
        {
          startTime: '2026-08-01T00:00:00.000Z',
          endTime: '2026-08-31T23:59:59.999Z',
        },
      ])
    ).toEqual([
      {
        startTime: '2026-08-01T00:00:00.000Z',
        endTime: '2026-08-31T23:59:59.999Z',
      },
    ]);
  });

  it('merges date-only boundaries with datetime boundaries', () => {
    expect(
      mergeUnavailablePeriods([
        { startTime: '2026-08-02', endTime: '2026-08-02' },
        {
          startTime: '2026-08-01T00:00:00.000Z',
          endTime: '2026-08-01T23:59:59.999Z',
        },
      ])
    ).toEqual([
      { startTime: '2026-08-01T00:00:00.000Z', endTime: '2026-08-02' },
    ]);
  });

  it('keeps a gap as a separate period and tolerates an empty list', () => {
    expect(
      mergeUnavailablePeriods([
        {
          startTime: '2026-08-10T00:00:00.000Z',
          endTime: '2026-08-10T23:59:59.999Z',
        },
        {
          startTime: '2026-08-01T00:00:00.000Z',
          endTime: '2026-08-02T23:59:59.999Z',
        },
      ])
    ).toEqual([
      {
        startTime: '2026-08-01T00:00:00.000Z',
        endTime: '2026-08-02T23:59:59.999Z',
      },
      {
        startTime: '2026-08-10T00:00:00.000Z',
        endTime: '2026-08-10T23:59:59.999Z',
      },
    ]);
    expect(mergeUnavailablePeriods([])).toEqual([]);
  });
});
