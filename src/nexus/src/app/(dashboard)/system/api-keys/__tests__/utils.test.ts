import { format, subDays } from 'date-fns';
import {
  clampUsageRange,
  defaultUsageRange,
  formatUsageLabel,
  maxDaysForInterval,
  ownerDisplayName,
  ownerPrimaryOrganisation,
  toApiDay,
  usageRangeLimitMessage,
} from '../utils';
import {
  API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS,
  API_KEY_USAGE_MAX_RANGE_DAYS,
} from '@/shared/hooks/useApiKeyUsage';
import type { ApiKeyUsageOwner } from '@/shared/types/apiKeyUsage';

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
      const span =
        (to!.getTime() - from!.getTime()) / (24 * 60 * 60 * 1000) + 1;
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
        (result.range.to!.getTime() - result.range.from!.getTime()) / 86400000 +
        1;
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
