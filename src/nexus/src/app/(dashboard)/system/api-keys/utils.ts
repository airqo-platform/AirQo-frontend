import { differenceInCalendarDays, format, subDays } from 'date-fns';
import type { DateRange } from '@/shared/components/calendar/types';
import type { ApiKeyUsageOwner } from '@/shared/types/apiKeyUsage';
import {
  API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS,
  API_KEY_USAGE_MAX_RANGE_DAYS,
} from '@/shared/hooks/useApiKeyUsage';

// Re-exported so the views have a single import path for the feature's date
// helpers. The caps themselves are defined once, next to the hooks that honour
// them, so the UI can never disagree with the request layer about the limits.
export { API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS, API_KEY_USAGE_MAX_RANGE_DAYS };

/** `DateRange` end picked for both views (7 days, ending today). */
export const defaultUsageRange = (): DateRange => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

/** `from`/`to` travel to the API as UTC calendar days (`YYYY-MM-DD`). */
export const toApiDay = (date: Date | undefined): string | undefined =>
  date ? format(date, 'yyyy-MM-dd') : undefined;

export interface ClampedRange {
  range: DateRange;
  /** True when the requested range was longer than `maxDays` and got trimmed. */
  clamped: boolean;
}

/**
 * Trims an over-long range back from `to` so it never exceeds the endpoint's
 * cap (92 days daily / 14 days hourly). Pure — the caller decides whether to
 * announce the change, so it is safe to call from render and from state
 * updaters alike.
 */
export const clampUsageRange = (
  range: DateRange,
  maxDays: number
): ClampedRange => {
  const { from, to } = range;
  if (!from || !to) return { range, clamped: false };

  const days = differenceInCalendarDays(to, from) + 1;
  if (days <= maxDays) return { range, clamped: false };

  return { range: { from: subDays(to, maxDays - 1), to }, clamped: true };
};

/** Human-readable cap message shared by both views. */
export const usageRangeLimitMessage = (
  interval: 'day' | 'hour',
  maxDays: number
): string =>
  `The ${interval === 'hour' ? 'hourly' : 'daily'} view supports at most ${maxDays} days. The range was shortened to the last ${maxDays} days.`;

/** Max days for a chart interval, matching the API's caps. */
export const maxDaysForInterval = (interval: 'day' | 'hour'): number =>
  interval === 'hour'
    ? API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS
    : API_KEY_USAGE_MAX_RANGE_DAYS;

/**
 * Usage charts display UTC buckets in the viewer's local time.
 *
 * `day` labels (`YYYY-MM-DD`) are parsed at LOCAL midnight so the printed day
 * matches the UTC day the API bucketed — parsing them as UTC would shift the
 * label a day backwards for viewers behind UTC. `hour` labels are UTC ISO
 * instants, so they are converted to local time.
 */
export const formatUsageLabel = (
  value: string,
  {
    interval,
    pattern,
  }: {
    interval: 'day' | 'hour';
    pattern?: string;
  }
): string => {
  const parsed =
    interval === 'day' ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return format(
    parsed,
    pattern ?? (interval === 'day' ? 'MMM d' : 'MMM d, HH:mm')
  );
};

/** Best available label for an owner in compact table cells. */
export const ownerDisplayName = (owner: ApiKeyUsageOwner): string =>
  owner.name || owner.email || '—';

/**
 * Everyone belongs to `airqo`, which the API always lists LAST, so index 0 is
 * the organisation that identifies the owner's team.
 */
export const ownerPrimaryOrganisation = (
  owner: ApiKeyUsageOwner
): string | undefined => owner.organisations?.[0]?.title;
