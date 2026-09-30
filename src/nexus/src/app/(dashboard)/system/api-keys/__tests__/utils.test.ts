import { differenceInCalendarDays, format, subDays } from 'date-fns';
import {
  buildUsageSeries,
  clampUsageRange,
  defaultUsageRange,
  formatUsageLabel,
  maxDaysForInterval,
  ownerDisplayName,
  ownerPrimaryOrganisation,
  toApiDay,
  USAGE_OTHER_SERIES,
  USAGE_TOTAL_SERIES,
  usageRangeLimitMessage,
} from '../utils';
import {
  API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS,
  API_KEY_USAGE_MAX_RANGE_DAYS,
} from '@/shared/hooks/useApiKeyUsage';
import type {
  ApiKeyUsageOwner,
  ApiKeyUsageTimeseriesData,
} from '@/shared/types/apiKeyUsage';

// Local-midnight helpers: `toISOString` would shift these a day backwards for
// viewers ahead of UTC and make the assertions timezone-dependent.
const day = (value: string) => new Date(`${value}T00:00:00`);
const asDay = (date: Date) => format(date, 'yyyy-MM-dd');

describe('api key usage date helpers', () => {
  describe('toApiDay', () => {
    it('formats the picked calendar day, not the UTC-shifted one', () => {
      // A user in UTC+3 picking "2026-09-01" must ask the API for 2026-09-01.
      expect(toApiDay(day('2026-09-01'))).toBe('2026-09-01');
    });

    it('returns undefined for a missing end of the range', () => {
      expect(toApiDay(undefined)).toBeUndefined();
    });
  });

  describe('defaultUsageRange', () => {
    it('spans 7 days ending today', () => {
      const { from, to } = defaultUsageRange();
      // Calendar days, not elapsed hours: a 24h offset miscounts across a DST
      // transition inside the window.
      const span = differenceInCalendarDays(to!, from!) + 1;
      expect(span).toBe(7);
    });
  });

  describe('clampUsageRange', () => {
    it('leaves a range within the cap untouched', () => {
      const range = { from: day('2026-09-01'), to: day('2026-09-07') };
      const result = clampUsageRange(range, API_KEY_USAGE_MAX_RANGE_DAYS);

      expect(result.clamped).toBe(false);
      expect(result.range).toBe(range);
    });

    it('trims an over-long range back from `to` and flags it', () => {
      const result = clampUsageRange(
        { from: day('2026-01-01'), to: day('2026-09-27') },
        API_KEY_USAGE_MAX_RANGE_DAYS
      );

      expect(result.clamped).toBe(true);
      expect(asDay(result.range.from!)).toBe(
        asDay(subDays(day('2026-09-27'), API_KEY_USAGE_MAX_RANGE_DAYS - 1))
      );
      expect(asDay(result.range.to!)).toBe('2026-09-27');
    });

    it('applies the tighter hourly cap', () => {
      const result = clampUsageRange(
        { from: day('2026-09-01'), to: day('2026-09-27') },
        API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS
      );

      expect(result.clamped).toBe(true);
      const days =
        differenceInCalendarDays(result.range.to!, result.range.from!) + 1;
      expect(days).toBe(API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS);
    });

    it('is a no-op while the range is still open', () => {
      const open = { from: day('2026-09-01'), to: undefined };
      const result = clampUsageRange(open, API_KEY_USAGE_MAX_RANGE_DAYS);

      expect(result.clamped).toBe(false);
      expect(result.range).toBe(open);
    });

    it('is pure — callers own the announcement', () => {
      // A state updater may be invoked more than once, so clamping must never
      // have side effects such as raising a toast.
      const range = { from: day('2026-01-01'), to: day('2026-09-27') };
      const first = clampUsageRange(range, API_KEY_USAGE_MAX_RANGE_DAYS);
      const second = clampUsageRange(range, API_KEY_USAGE_MAX_RANGE_DAYS);

      expect(second).toEqual(first);
      expect(jest.fn().mock.calls).toHaveLength(0);
    });
  });

  describe('maxDaysForInterval', () => {
    it('maps intervals to the API caps', () => {
      expect(maxDaysForInterval('day')).toBe(API_KEY_USAGE_MAX_RANGE_DAYS);
      expect(maxDaysForInterval('hour')).toBe(
        API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS
      );
    });
  });

  it('explains which view was capped', () => {
    expect(usageRangeLimitMessage('hour', 14)).toContain('hourly');
    expect(usageRangeLimitMessage('day', 92)).toContain('daily');
    expect(usageRangeLimitMessage('day', 92)).toContain('92 days');
  });
});

describe('formatUsageLabel', () => {
  it('keeps day buckets on their UTC calendar day in every timezone', () => {
    // `YYYY-MM-DD` buckets are calendar days, not instants: parsing them as
    // UTC would print the previous day for viewers behind UTC.
    expect(formatUsageLabel('2026-09-01', { interval: 'day' })).toBe('Sep 1');
    expect(formatUsageLabel('2026-12-31', { interval: 'day' })).toBe('Dec 31');
  });

  it('converts hourly UTC instants into the viewer local time', () => {
    const instant = new Date('2026-09-27T15:00:00Z');
    // Same formatter and timezone as the component under test.
    const expected = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(instant);

    expect(formatUsageLabel('2026-09-27T15:00:00Z', { interval: 'hour' })).toBe(
      expected
    );
  });

  it('supports a custom pattern for tooltip headers', () => {
    expect(
      formatUsageLabel('2026-09-27', {
        interval: 'day',
        pattern: 'MMM d, yyyy',
      })
    ).toBe('Sep 27, 2026');
  });

  it('passes unparseable labels through instead of rendering "Invalid Date"', () => {
    expect(formatUsageLabel('not-a-date', { interval: 'hour' })).toBe(
      'not-a-date'
    );
  });
});

describe('buildUsageSeries', () => {
  const timeseries = (
    overrides: Partial<ApiKeyUsageTimeseriesData> = {}
  ): ApiKeyUsageTimeseriesData => ({
    range: { from: '2026-09-21', to: '2026-09-23', days: 3 },
    interval: 'day',
    service: null,
    labels: ['2026-09-21', '2026-09-22', '2026-09-23'],
    series: [
      {
        client_id: 'c1',
        label: 'heavy-pipeline',
        owner_name: 'Jane Doe',
        owner_email: 'jane@example.com',
        total: 6,
        data: [1, 2, 3],
      },
    ],
    other: [0, 1, 0],
    total: [1, 3, 3],
    ...overrides,
  });

  it('emits one point per label per series, in long format', () => {
    const { data, labels, seriesCount } = buildUsageSeries(timeseries());

    // 3 labels × (1 key + other + total)
    expect(data).toHaveLength(9);
    expect(data[0]).toEqual({
      time: '2026-09-21',
      value: 1,
      site: 'c1',
      device_id: '',
    });
    expect(labels).toEqual({
      c1: 'heavy-pipeline — Jane Doe',
      [USAGE_OTHER_SERIES]: 'Other keys',
      [USAGE_TOTAL_SERIES]: 'All keys',
    });
    expect(seriesCount).toBe(3);
  });

  it('falls back to the key label when the owner is unknown', () => {
    const { labels } = buildUsageSeries(
      timeseries({
        series: [
          {
            client_id: 'c1',
            label: 'k',
            owner_name: null,
            total: 1,
            data: [1, 1, 1],
          },
        ],
      })
    );

    expect(labels.c1).toBe('k');
  });

  it('omits `other` when the API reports it as null', () => {
    const { data, labels } = buildUsageSeries(timeseries({ other: null }));

    expect(labels[USAGE_OTHER_SERIES]).toBeUndefined();
    // 3 labels × (1 key + total)
    expect(data).toHaveLength(6);
  });

  it('omits `other` when every value is zero', () => {
    const { labels } = buildUsageSeries(timeseries({ other: [0, 0, 0] }));

    expect(labels[USAGE_OTHER_SERIES]).toBeUndefined();
  });

  it('coerces short or missing series arrays to 0 instead of undefined', () => {
    const { data } = buildUsageSeries(
      timeseries({
        labels: ['2026-09-21', '2026-09-22'],
        series: [
          {
            client_id: 'c1',
            label: 'k',
            total: 1,
            data: [7], // shorter than labels
          },
        ],
        other: null,
        total: [7, undefined as never],
      })
    );

    // Recharts cannot plot undefined — every value must be a number.
    expect(data.every(point => Number.isFinite(point.value))).toBe(true);
    // Grouped per label: label 0 → [key 7, total 7], label 1 → [key 0, total 0]
    expect(data.map(point => point.value)).toEqual([7, 7, 0, 0]);
  });

  it('keeps every point aligned to its label index', () => {
    const { data } = buildUsageSeries(timeseries());

    // For each label, the values must line up with the source arrays.
    ['2026-09-21', '2026-09-22', '2026-09-23'].forEach((label, index) => {
      const forLabel = data.filter(point => point.time === label);
      expect(forLabel.map(point => point.value)).toEqual([
        [1, 2, 3][index],
        [0, 1, 0][index],
        [1, 3, 3][index],
      ]);
    });
  });

  it('handles a full 92-day, 10-key daily payload without gaps', () => {
    const labels = Array.from({ length: 92 }, (_, i) =>
      format(subDays(new Date('2026-09-27'), 91 - i), 'yyyy-MM-dd')
    );
    const series = Array.from({ length: 10 }, (_, s) => ({
      client_id: `c${s}`,
      label: `key-${s}`,
      owner_name: null,
      total: 92,
      data: labels.map((_, i) => (i + s) % 7),
    }));

    const { data, seriesCount } = buildUsageSeries({
      ...timeseries(),
      labels,
      series,
      other: labels.map((_, i) => i % 2),
      total: labels.map((_, i) => i * 2),
    });

    // 92 labels × (10 keys + other + total)
    expect(data).toHaveLength(92 * 12);
    expect(seriesCount).toBe(12);
    expect(data.every(point => Number.isFinite(point.value))).toBe(true);
    expect(new Set(data.map(point => point.time)).size).toBe(92);
  });

  it('handles the densest hourly payload (14 days × 24 buckets)', () => {
    const labels = Array.from({ length: 336 }, (_, i) =>
      new Date(Date.UTC(2026, 8, 14, 0, i)).toISOString()
    );

    const { data, seriesCount } = buildUsageSeries({
      ...timeseries(),
      interval: 'hour',
      labels,
      series: [
        {
          client_id: 'c1',
          label: 'k',
          total: 336,
          data: labels.map(i => i.length),
        },
      ],
      other: null,
      total: labels.map(label => label.length),
    });

    // 336 labels × (1 key + total)
    expect(data).toHaveLength(672);
    expect(seriesCount).toBe(2);
    expect(data.every(point => point.value > 0)).toBe(true);
  });

  it('returns nothing chartable for an empty response', () => {
    const { data, seriesCount } = buildUsageSeries(
      timeseries({ labels: [], series: [], other: null, total: [] })
    );

    expect(data).toHaveLength(0);
    expect(seriesCount).toBe(1); // the total line label remains
  });
});

describe('owner display helpers', () => {
  const owner: ApiKeyUsageOwner = {
    user_id: 'u1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    organisations: [
      { group_id: 'g1', title: 'Makerere Research Team' },
      { group_id: 'g2', title: 'airqo' },
    ],
  };

  it('prefers the full name, then the email', () => {
    expect(ownerDisplayName(owner)).toBe('Jane Doe');
    expect(ownerDisplayName({ ...owner, name: null })).toBe('jane@example.com');
    expect(
      ownerDisplayName({ ...owner, name: null, email: null as never })
    ).toBe('—');
  });

  it('reads the team from the first organisation, since airqo is last', () => {
    expect(ownerPrimaryOrganisation(owner)).toBe('Makerere Research Team');
  });

  it('tolerates a missing organisations list', () => {
    expect(
      ownerPrimaryOrganisation({
        ...owner,
        organisations: undefined as never,
      })
    ).toBeUndefined();
  });
});
