import type { AnalyticsReport } from '@/shared/types/api';
import {
  formatReportValue,
  getPickedReportDate,
  getReportDailySeries,
  getReportDiurnalSeries,
  getReportPeriodDayCount,
  getReportPeriodError,
  getReportPeriodInputBounds,
  getReportRequestRange,
  getReportSiteRows,
  getReportSummary,
  hasReportData,
  MAX_REPORT_PERIOD_DAYS,
  sanitizeReportMessage,
} from './reportUtils';

describe('sanitizeReportMessage', () => {
  it('removes a leaked cohort id from service copy', () => {
    // The exact string that reached the dashboard empty state.
    expect(
      sanitizeReportMessage(
        'No data available for cohort 67aaf6796bb3cc001374cd0b for the selected period (2026-09-30 to 2026-09-30).'
      )
    ).toBe(
      'No data available for the selected period (2026-09-30 to 2026-09-30).'
    );
  });

  it('removes identifiers for other internal resources', () => {
    expect(
      sanitizeReportMessage('No data available for group 12 in that window.')
    ).toBe('No data available in that window.');
    expect(
      sanitizeReportMessage('No data available for device airqo-g5187.')
    ).toBe('No data available.');
    expect(
      sanitizeReportMessage(
        'No data available for cohort cohort-1 for the period.'
      )
    ).toBe('No data available for the period.');
  });

  it('removes a bare ObjectId even without a resource word', () => {
    expect(
      sanitizeReportMessage('Lookup 67aaf6796bb3cc001374cd0b failed.')
    ).toBe('Lookup failed.');
  });

  it('leaves readable names and ordinary copy untouched', () => {
    expect(
      sanitizeReportMessage(
        'No data available for site Kampala in that window.'
      )
    ).toBe('No data available for site Kampala in that window.');
    expect(sanitizeReportMessage('Try a different date range or cohort.')).toBe(
      'Try a different date range or cohort.'
    );
    expect(sanitizeReportMessage('')).toBe('');
  });

  it('keeps a long readable name — length alone is not an identifier', () => {
    // "Johannesburg" is 12 characters; a length-only rule deleted the name.
    expect(
      sanitizeReportMessage(
        'No data available for site Johannesburg in that window.'
      )
    ).toBe('No data available for site Johannesburg in that window.');
    expect(
      sanitizeReportMessage('No data available for site Gulu Main Market.')
    ).toBe('No data available for site Gulu Main Market.');
  });

  it('tidies punctuation left dangling by a removal', () => {
    expect(sanitizeReportMessage('No data for cohort abc123def456.')).toBe(
      'No data.'
    );
    expect(sanitizeReportMessage('Values for device abc123def456 ()')).toBe(
      'Values'
    );
  });
});

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

const rangeOf = (from: Date, to: Date) => ({ from, to });

// Fixed "now" (Nov 15 2026) so the future-date guard cannot flake with the
// machine clock and the September ranges below stay in the past.
const NOW = new Date(2026, 10, 15, 9, 0, 0);

describe('report period limit', () => {
  it('caps the report period at the backend month limit', () => {
    expect(MAX_REPORT_PERIOD_DAYS).toBe(31);

    // Sep 1 → Oct 1 is exactly 31 inclusive dates: still allowed.
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 9, 1)),
        NOW
      )
    ).toBeNull();
    // One more date crosses the cap.
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 9, 2)),
        NOW
      )
    ).toMatch(/up to 31 days/i);
  });

  it('counts the period in inclusive calendar days', () => {
    // A single day is valid; two days apart is 3 dates and still valid.
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 8, 1)),
        NOW
      )
    ).toBeNull();
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 8, 3)),
        NOW
      )
    ).toBeNull();
  });

  it('rejects a missing, inverted or future period', () => {
    expect(
      getReportPeriodError({ from: undefined, to: new Date(2026, 8, 1) }, NOW)
    ).toMatch(/start and end date/i);
    expect(
      getReportPeriodError({ from: new Date(2026, 8, 10), to: undefined }, NOW)
    ).toMatch(/start and end date/i);
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 8, 20), new Date(2026, 8, 10)),
        NOW
      )
    ).toMatch(/on or after the start date/i);
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 10, 14), new Date(2026, 10, 20)),
        NOW
      )
    ).toMatch(/cannot run into the future/i);
    // A start date that has not arrived yet.
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 10, 16), new Date(2026, 10, 20)),
        NOW
      )
    ).toMatch(/cannot run into the future/i);
  });

  it('accepts a period ending today, whose end is stored as end-of-day', () => {
    // End-of-day today is always ahead of `now`; rejecting on instants would
    // make the default "up to today" range permanently invalid.
    expect(
      getReportPeriodError(
        rangeOf(
          new Date(2026, 10, 15),
          new Date(2026, 10, 15, 23, 59, 59, 999)
        ),
        NOW
      )
    ).toBeNull();
    expect(
      getReportPeriodError(
        rangeOf(new Date(2026, 9, 16), new Date(2026, 10, 15, 23, 59, 59, 999)),
        NOW
      )
    ).toBeNull();
  });
});

describe('getReportPeriodDayCount', () => {
  it('counts inclusive calendar days so the hint and the guard agree', () => {
    // Both the "N of 31 days" hint and the validity guard read this, so it is
    // inclusive: one selected day is 1, and a start/end 30 days apart is 31 —
    // which is exactly the cap the report view allows.
    expect(
      getReportPeriodDayCount(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 8, 1))
      )
    ).toBe(1);
    expect(
      getReportPeriodDayCount(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 8, 31))
      )
    ).toBe(31);
    // Sep 1 → Oct 1 is still exactly 31 inclusive dates.
    expect(
      getReportPeriodDayCount(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 9, 1))
      )
    ).toBe(31);
    // One day past the cap.
    expect(
      getReportPeriodDayCount(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 9, 2))
      )
    ).toBe(32);
    expect(getReportPeriodDayCount({ from: undefined, to: undefined })).toBe(0);
    expect(
      getReportPeriodDayCount({ from: new Date(2026, 8, 1), to: undefined })
    ).toBe(0);
  });
});

describe('report period bounds', () => {
  it('caps the end bound at start + 30 days so the calendar cannot exceed the limit', () => {
    // Start Sep 1 → the last selectable end is Oct 1 (31 inclusive dates),
    // which is before "today", so the cap wins over the today bound.
    expect(
      getReportPeriodInputBounds(
        rangeOf(new Date(2026, 8, 1), new Date(2026, 8, 5)),
        NOW
      ).maxEnd
    ).toEqual(new Date(2026, 9, 1));

    // A start whose cap lands after today is capped by today instead.
    expect(
      getReportPeriodInputBounds(
        rangeOf(new Date(2026, 9, 20), new Date(2026, 9, 25)),
        NOW
      ).maxEnd
    ).toEqual(new Date(2026, 10, 15));
  });

  it('never lets the start pass the end, and never offers a future date', () => {
    const bounds = getReportPeriodInputBounds(
      rangeOf(new Date(2026, 8, 4), new Date(2026, 8, 10)),
      NOW
    );

    expect(bounds.minEnd).toEqual(new Date(2026, 8, 4));
    expect(bounds.maxStart).toEqual(new Date(2026, 8, 10));
    // Sep 4 + 30 days = Oct 4, which is before "today" (Nov 15).
    expect(bounds.maxEnd).toEqual(new Date(2026, 9, 4));

    // Before a start is chosen the only bound is today.
    expect(
      getReportPeriodInputBounds({ from: undefined, to: undefined }, NOW)
    ).toEqual({
      minEnd: undefined,
      maxStart: new Date(2026, 10, 15),
      maxEnd: new Date(2026, 10, 15),
    });
  });
});

describe('getPickedReportDate', () => {
  const picked = new Date(2026, 8, 4);

  it('passes through the Date the picker emits in single mode', () => {
    expect(getPickedReportDate(picked)).toBe(picked);
  });

  it('coerces the string and range shapes the onChange contract allows', () => {
    expect(getPickedReportDate('2026-09-04')).toEqual(new Date(2026, 8, 4));
    expect(
      getPickedReportDate({ from: '2026-09-04', to: '2026-09-30' })
    ).toEqual(new Date(2026, 8, 4));
    expect(getPickedReportDate({ from: picked, to: picked })).toBe(picked);
  });

  it('returns null for anything unusable so the selection is left alone', () => {
    expect(getPickedReportDate(undefined)).toBeNull();
    expect(getPickedReportDate(null)).toBeNull();
    expect(getPickedReportDate('')).toBeNull();
    expect(getPickedReportDate('not-a-date')).toBeNull();
    expect(getPickedReportDate('2026-02-31')).toBeNull();
    expect(getPickedReportDate(new Date('nope'))).toBeNull();
    expect(getPickedReportDate({ to: '2026-09-30' })).toBeNull();
    expect(getPickedReportDate(42)).toBeNull();
  });
});
