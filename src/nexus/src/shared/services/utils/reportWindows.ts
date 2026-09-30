import type {
  AnalyticsReport,
  AnalyticsReportAggregateRow,
  AnalyticsReportDeviceSummary,
  AnalyticsReportPeriod,
  AnalyticsReportRequest,
} from '../../types/api';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Per-request date window the analytics report routers accept. The analytics
 * routers README documents a default `MAX_HOURLY_QUERY_DAYS` of 31 days, but
 * the staging deployment (verified live) enforces 27 calendar dates
 * inclusive — 28 dates returns HTTP 400 "The requested date range is too
 * wide. Shorten the date range." — so every request stays at or below 27
 * UTC calendar dates.
 */
export const REPORT_WINDOW_DAYS = 27;

/**
 * Transport-level cap for a single `getReport` call: the widest range the
 * adaptive window/merge loop below is asked to handle. The report route is
 * rate limited to 10 requests / 60 s per client, and longer ranges need one
 * request per `REPORT_WINDOW_DAYS` window; 92 days is at most 4 windows, which
 * keeps the BFF token safely inside that limit.
 *
 * This is NOT the product limit. The report service itself is month-scoped, so
 * the organization report view caps the user's selection at 31 days
 * (`MAX_REPORT_PERIOD_DAYS` in the org-dashboard module) before a request is
 * built. This constant stays as the backstop for any caller that skips it.
 */
export const MAX_REPORT_RANGE_DAYS = 92;

const ISO_DATE_PART = /^(\d{4}-\d{2}-\d{2})/;

const toUtcDatePart = (value: string): string => {
  const trimmed = value.trim();
  const match = ISO_DATE_PART.exec(trimmed);
  if (match) return match[1];
  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed)
    ? new Date(parsed).toISOString().slice(0, 10)
    : '';
};

const toUtcMs = (datePart: string): number =>
  Date.parse(`${datePart}T00:00:00.000Z`);

const fromUtcMs = (ms: number): string =>
  new Date(ms).toISOString().slice(0, 10);

/**
 * Split a report request into consecutive windows of at most
 * `REPORT_WINDOW_DAYS` UTC calendar dates. The first window starts at the
 * requested start time, the last window ends exactly at the requested end
 * time, and intermediate boundaries keep the `T00:00:00.000Z` /
 * `T23:59:59.999Z` day edges. A range that already fits yields a single
 * window with the request's boundaries unchanged.
 */
export const buildReportWindows = (
  request: AnalyticsReportRequest
): AnalyticsReportRequest[] => {
  const cohortId = String(request.cohort_id ?? '').trim();
  const startTime = String(request.start_time ?? '').trim();
  const endTime = String(request.end_time ?? '').trim();
  const startDate = toUtcDatePart(startTime);
  const endDate = toUtcDatePart(endTime);
  const startMs = startDate ? toUtcMs(startDate) : Number.NaN;
  const endMs = endDate ? toUtcMs(endDate) : Number.NaN;

  // Unparseable or inverted ranges are the caller's validation problem
  // (see `buildReportPayload`); emit a single verbatim window.
  if (
    !cohortId ||
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs < startMs
  ) {
    return [{ cohort_id: cohortId, start_time: startTime, end_time: endTime }];
  }

  const windows: AnalyticsReportRequest[] = [];
  for (let cursorMs = startMs; cursorMs <= endMs;) {
    const windowEndMs = Math.min(
      cursorMs + (REPORT_WINDOW_DAYS - 1) * MS_PER_DAY,
      endMs
    );
    windows.push({
      cohort_id: cohortId,
      start_time:
        windows.length === 0
          ? startTime
          : `${fromUtcMs(cursorMs)}T00:00:00.000Z`,
      end_time:
        windowEndMs === endMs
          ? endTime
          : `${fromUtcMs(windowEndMs)}T23:59:59.999Z`,
    });
    cursorMs = windowEndMs + MS_PER_DAY;
  }

  return windows;
};

/**
 * Extract the UTC calendar date parts (`YYYY-MM-DD`) from a report window's
 * boundaries. Used by splitting and month-classification helpers that need
 * calendar semantics, not the wire timestamps.
 */
export const getWindowDateParts = (
  window: AnalyticsReportRequest
): { startDate: string; endDate: string } => ({
  startDate: toUtcDatePart(String(window.start_time ?? '')),
  endDate: toUtcDatePart(String(window.end_time ?? '')),
});

/** Count the UTC calendar dates covered by a window (inclusive). */
export const countWindowDays = (window: AnalyticsReportRequest): number => {
  const { startDate, endDate } = getWindowDateParts(window);
  const startMs = toUtcMs(startDate);
  const endMs = toUtcMs(endDate);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;
  return Math.floor((endMs - startMs) / MS_PER_DAY) + 1;
};

const monthKeyOf = (datePart: string): string => datePart.slice(0, 7);

/**
 * Last UTC calendar date (`YYYY-MM-DD`) of the month that `datePart` falls in.
 */
const lastDayOfMonth = (datePart: string): string => {
  const year = Number(datePart.slice(0, 4));
  const month = Number(datePart.slice(5, 7));
  if (!Number.isFinite(year) || !Number.isFinite(month)) return datePart;
  // Day 0 of next month is the last day of the current month.
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${datePart.slice(0, 4)}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

/**
 * Split a failing report window into two smaller windows for a retry
 * attempt. Two strategies, chosen in order:
 *
 * 1. If the window spans two calendar months, split at the month boundary —
 *    the backend deterministically rejects ranges that cross month edges or
 *    touch certain months, so each half stays within one month. The boundary
 *    is only taken when the start-month residual is more than 1 day;
 *    otherwise (e.g. Aug 31 → Sep 10) it would produce a useless 1-day-first
 *    pair, so the split falls back to the midpoint.
 * 2. Otherwise split at the midpoint (floor of half the day count).
 *
 * Both strategies always produce two strictly smaller parts, so the caller's
 * adaptive loop terminates.
 *
 * Returns null for a 1-day window that cannot be split further; the caller
 * should mark it unavailable.
 */
export const splitReportWindow = (
  window: AnalyticsReportRequest
): [AnalyticsReportRequest, AnalyticsReportRequest] | null => {
  const cohortId = String(window.cohort_id ?? '').trim();
  const { startDate, endDate } = getWindowDateParts(window);
  const startMs = toUtcMs(startDate);
  const endMs = toUtcMs(endDate);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;

  const days = Math.floor((endMs - startMs) / MS_PER_DAY) + 1;
  if (days <= 1) return null;

  const startMonth = monthKeyOf(startDate);
  const endMonth = monthKeyOf(endDate);

  const midpointMs = startMs + Math.floor((days - 1) / 2) * MS_PER_DAY;

  let splitMs: number;
  if (startMonth !== endMonth) {
    // Month-boundary split: first part ends at the last day of the start month.
    const boundaryMs = toUtcMs(lastDayOfMonth(startDate));
    const startMonthResidualDays =
      Math.floor((boundaryMs - startMs) / MS_PER_DAY) + 1;
    // Take the month boundary only when it really splits the window: the
    // boundary must be inside the range and the start-month residual must be
    // more than a single day (a 1-day residual would yield a degenerate
    // 1-day-first pair, so the balanced midpoint is the better split).
    if (boundaryMs < endMs && startMonthResidualDays > 1) {
      splitMs = boundaryMs;
    } else {
      splitMs = midpointMs;
    }
  } else {
    splitMs = midpointMs;
  }

  const first: AnalyticsReportRequest = {
    cohort_id: cohortId,
    start_time:
      startDate === String(window.start_time ?? '').trim()
        ? String(window.start_time ?? '').trim()
        : `${startDate}T00:00:00.000Z`,
    end_time: `${fromUtcMs(splitMs)}T23:59:59.999Z`,
  };
  const second: AnalyticsReportRequest = {
    cohort_id: cohortId,
    start_time: `${fromUtcMs(splitMs + MS_PER_DAY)}T00:00:00.000Z`,
    end_time:
      endDate === String(window.end_time ?? '').trim()
        ? String(window.end_time ?? '').trim()
        : `${endDate}T23:59:59.999Z`,
  };

  return [first, second];
};

/**
 * Sort unavailable periods ascending and coalesce entries that overlap or
 * touch (adjacent UTC calendar days) into a single period. A rejected month
 * is recorded as one window per split leaf, which would otherwise render as
 * dozens of consecutive entries in the dashboard's warning banner.
 *
 * Pure: the input array and its entries are never mutated. Entries whose
 * boundaries are not parseable calendar dates are kept verbatim (sorted
 * last, never merged) so no rejection is silently dropped.
 */
export const mergeUnavailablePeriods = (
  periods: AnalyticsReportPeriod[]
): AnalyticsReportPeriod[] => {
  const dated: {
    startMs: number;
    endMs: number;
    period: AnalyticsReportPeriod;
  }[] = [];
  const undated: AnalyticsReportPeriod[] = [];

  for (const period of periods) {
    const startTime = String(period.startTime ?? '').trim();
    const endTime = String(period.endTime ?? '').trim();
    const startMs = toUtcMs(toUtcDatePart(startTime));
    const endMs = toUtcMs(toUtcDatePart(endTime));
    if (
      Number.isFinite(startMs) &&
      Number.isFinite(endMs) &&
      startMs <= endMs
    ) {
      dated.push({ startMs, endMs, period: { startTime, endTime } });
    } else {
      undated.push({ startTime, endTime });
    }
  }

  dated.sort(
    (left, right) => left.startMs - right.startMs || left.endMs - right.endMs
  );

  const merged: AnalyticsReportPeriod[] = [];
  for (const entry of dated) {
    const last = merged[merged.length - 1];
    if (last) {
      const lastEndDayMs = toUtcMs(toUtcDatePart(last.endTime));
      // Overlapping or adjacent calendar days (next start is on or before
      // the day after the previous end) extend the previous period.
      if (entry.startMs <= lastEndDayMs + MS_PER_DAY) {
        if (
          entry.endMs > lastEndDayMs ||
          (entry.endMs === lastEndDayMs &&
            Date.parse(entry.period.endTime) > Date.parse(last.endTime))
        ) {
          last.endTime = entry.period.endTime;
        }
        continue;
      }
    }
    merged.push({ ...entry.period });
  }

  return merged.concat(undated);
};

const getRows = (rows: unknown): AnalyticsReportAggregateRow[] =>
  Array.isArray(rows) ? (rows as AnalyticsReportAggregateRow[]) : [];

const concatRows = (
  reports: AnalyticsReport[],
  select: (report: AnalyticsReport) => unknown
): AnalyticsReportAggregateRow[] =>
  reports.flatMap(report => getRows(select(report)));

const jsonKey = (row: AnalyticsReportAggregateRow): string =>
  `json:${JSON.stringify(row)}`;

const dailyKey = (row: AnalyticsReportAggregateRow): string => {
  const date = typeof row.date === 'string' ? row.date.trim() : '';
  return date || jsonKey(row);
};

const datetimeKey = (row: AnalyticsReportAggregateRow): string => {
  const base =
    typeof row.date === 'string' && row.date.trim()
      ? row.date.trim()
      : row.timestamp !== undefined && row.timestamp !== null
        ? String(row.timestamp)
        : '';
  if (!base) return jsonKey(row);
  return row.hour === undefined || row.hour === null
    ? base
    : `${base}|${String(row.hour).padStart(2, '0')}`;
};

const dailySortKey = (row: AnalyticsReportAggregateRow): string => {
  const key = dailyKey(row);
  return key.startsWith('json:') ? `~${key}` : key;
};

const datetimeSortKey = (row: AnalyticsReportAggregateRow): string => {
  const key = datetimeKey(row);
  return key.startsWith('json:') ? `~${key}` : key;
};

/** Concat, dedupe by key and sort ascending. First occurrence wins. */
const concatDedupeSorted = (
  rows: AnalyticsReportAggregateRow[],
  keyOf: (row: AnalyticsReportAggregateRow) => string,
  sortKeyOf: (row: AnalyticsReportAggregateRow) => string
): AnalyticsReportAggregateRow[] => {
  const seen = new Set<string>();
  const unique: AnalyticsReportAggregateRow[] = [];
  for (const row of rows) {
    const key = keyOf(row);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique.sort((left, right) =>
    sortKeyOf(left).localeCompare(sortKeyOf(right))
  );
};

const PM_FIELD_PATTERN = /^pm(2_5|10)_/;

/**
 * Inclusive UTC calendar-day count for a window, used as the merge weight.
 * The backend returns no per-row sample counts, so a window's own span is the
 * only available proxy for how many days each of its means represents.
 */
const periodDayCount = (report: AnalyticsReport): number => {
  const start = Date.parse(String(report.period?.startTime ?? ''));
  const end = Date.parse(String(report.period?.endTime ?? ''));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 1;
  }
  return Math.max(
    1,
    Math.floor(end / MS_PER_DAY) - Math.floor(start / MS_PER_DAY) + 1
  );
};

/**
 * Collects each report's rows together with that report's day weight, so a
 * 1-day window is not averaged equally with a 26-day one after the adaptive
 * loop splits a rejected range.
 */
const collectWeightedRows = (
  reports: AnalyticsReport[],
  select: (report: AnalyticsReport) => unknown
): { row: AnalyticsReportAggregateRow; weight: number }[] =>
  reports.flatMap(report => {
    const weight = periodDayCount(report);
    return getRows(select(report)).map(row => ({ row, weight }));
  });

/**
 * Weighted mean of the numeric `pm2_5_*` / `pm10_*` fields. Identity fields
 * (site name, lat/long, hour, ...) come from the first row of the group, so
 * only the PM values are recombined.
 */
const averagePMFieldsWeighted = (
  entries: { row: AnalyticsReportAggregateRow; weight: number }[]
): AnalyticsReportAggregateRow => {
  const merged: AnalyticsReportAggregateRow = { ...entries[0].row };
  const pmFields = new Set<string>();
  entries.forEach(({ row }) => {
    Object.keys(row).forEach(key => {
      if (PM_FIELD_PATTERN.test(key)) pmFields.add(key);
    });
  });
  pmFields.forEach(field => {
    let weightedSum = 0;
    let totalWeight = 0;
    entries.forEach(({ row, weight }) => {
      const value = row[field];
      if (typeof value === 'number' && Number.isFinite(value)) {
        weightedSum += value * weight;
        totalWeight += weight;
      }
    });
    merged[field] = totalWeight > 0 ? weightedSum / totalWeight : null;
  });
  return merged;
};

/**
 * Group weighted rows by a natural key and take each group's weighted mean.
 * `keyOf` receives the row and its position within its source report, so
 * index-based fallbacks stay stable per window.
 */
const weightedGroupAndAverage = (
  entries: { row: AnalyticsReportAggregateRow; weight: number }[],
  keyOf: (row: AnalyticsReportAggregateRow, index: number) => string
): AnalyticsReportAggregateRow[] => {
  const groups = new Map<
    string,
    { row: AnalyticsReportAggregateRow; weight: number }[]
  >();
  entries.forEach((entry, index) => {
    const key = keyOf(entry.row, index);
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  });
  return Array.from(groups.values(), averagePMFieldsWeighted);
};

const siteKey = (row: AnalyticsReportAggregateRow, index: number): string => {
  const name = typeof row.site_name === 'string' ? row.site_name.trim() : '';
  return name ? `site:${name}` : `index:${index}`;
};

const hourKey = (row: AnalyticsReportAggregateRow, index: number): string =>
  row.hour === undefined || row.hour === null
    ? `index:${index}`
    : `hour:${row.hour}`;

const dayKey = (row: AnalyticsReportAggregateRow, index: number): string => {
  const day = typeof row.day === 'string' ? row.day.trim() : '';
  return day ? `day:${day}` : `index:${index}`;
};

const dayHourKey = (
  row: AnalyticsReportAggregateRow,
  index: number
): string => {
  const day = typeof row.day === 'string' ? row.day.trim() : '';
  if (!day || row.hour === undefined || row.hour === null) {
    return `index:${index}`;
  }
  return `day:${day}|hour:${row.hour}`;
};

/**
 * Concat and dedupe by the row's distinguishing fields (JSON fallback).
 *
 * Used for the monthly/annual and region aggregates that the dashboard does
 * not currently render: they keep the first window's row for a shared key, so
 * a key split across two windows reflects only that first window. This is a
 * known limitation rather than an oversight — weight-accurate merging needs
 * per-row sample counts the backend does not return, and no consumer reads
 * these arrays today (see `hasReportData`, the only current reference).
 */
const concatDedupeByFields = (
  rows: AnalyticsReportAggregateRow[],
  fields: string[]
): AnalyticsReportAggregateRow[] => {
  const seen = new Set<string>();
  const unique: AnalyticsReportAggregateRow[] = [];
  for (const row of rows) {
    const values = fields.map(field => row[field]);
    const hasDistinguishingValue = values.some(
      value => value !== undefined && value !== null && value !== ''
    );
    const key = hasDistinguishingValue ? JSON.stringify(values) : jsonKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
};

const mergeDevices = (
  reports: AnalyticsReport[]
): AnalyticsReportDeviceSummary => {
  const summaries = reports
    .map(report => report?.devices)
    .filter((devices): devices is AnalyticsReportDeviceSummary =>
      Boolean(devices)
    );

  const deviceIds = Array.from(
    new Set(
      summaries.flatMap(devices =>
        Array.isArray(devices.device_ids)
          ? devices.device_ids.filter(
              (id): id is string => typeof id === 'string'
            )
          : []
      )
    )
  );
  const cohortNames = Array.from(
    new Set(
      summaries.flatMap(devices =>
        Array.isArray(devices['cohort name'])
          ? devices['cohort name'].filter(
              (name): name is string => typeof name === 'string'
            )
          : []
      )
    )
  );
  const numberOfDevices = summaries.reduce((max, devices) => {
    const value =
      typeof devices.number_of_devices === 'number' &&
      Number.isFinite(devices.number_of_devices)
        ? devices.number_of_devices
        : 0;
    return Math.max(max, value);
  }, 0);

  return {
    device_ids: deviceIds,
    number_of_devices: numberOfDevices,
    ...(cohortNames.length > 0 ? { 'cohort name': cohortNames } : {}),
  };
};

/**
 * Merge consecutive report windows into a single report covering the overall
 * requested period. `request` supplies the cohort id and the overall period
 * boundaries (the same normalized payload sent through `buildReportWindows`).
 * `unavailablePeriods` lists windows the backend rejected after all adaptive
 * retries; it is attached to the merged report so the UI can flag them.
 */
export const mergeReportWindows = (
  reports: AnalyticsReport[],
  request: AnalyticsReportRequest,
  unavailablePeriods?: AnalyticsReportPeriod[]
): AnalyticsReport => {
  const cohortId = String(request.cohort_id ?? '').trim();
  const startDate = toUtcDatePart(String(request.start_time ?? ''));
  const endDate = toUtcDatePart(String(request.end_time ?? ''));

  const dailyMeanPm = concatDedupeSorted(
    concatRows(reports, report => report.daily_mean_pm),
    dailyKey,
    dailySortKey
  );
  const datetimeMeanPm = concatDedupeSorted(
    concatRows(reports, report => report.datetime_mean_pm),
    datetimeKey,
    datetimeSortKey
  );
  const primaryIsEmpty =
    dailyMeanPm.length === 0 && datetimeMeanPm.length === 0;

  return {
    status: 'success',
    // Match the backend's empty-result wording with the overall period so
    // the dashboard's no-data state stays accurate across merged windows.
    ...(primaryIsEmpty
      ? {
          message: `No data available for cohort ${cohortId} for the selected period (${startDate} to ${endDate}).`,
        }
      : {}),
    ...(unavailablePeriods && unavailablePeriods.length > 0
      ? { unavailablePeriods }
      : {}),
    cohort_id: cohortId,
    devices: mergeDevices(reports),
    period: {
      startTime: String(request.start_time ?? '').trim(),
      endTime: String(request.end_time ?? '').trim(),
    },
    daily_mean_pm: dailyMeanPm,
    datetime_mean_pm: datetimeMeanPm,
    // The dashboard renders diurnal ("Typical day profile") and site_mean_pm
    // ("Site comparison"), so these are day-weighted across merged windows
    // rather than averaged as bare means-of-means. The backend returns no
    // per-row sample counts, so each window's own span is the weight.
    diurnal: weightedGroupAndAverage(
      collectWeightedRows(reports, report => report.diurnal),
      hourKey
    ),
    annual_pm: concatDedupeByFields(
      concatRows(reports, report => report.annual_pm),
      ['year']
    ),
    monthly_pm: concatDedupeByFields(
      concatRows(reports, report => report.monthly_pm),
      ['year', 'month']
    ),
    pm_by_month_year: concatDedupeByFields(
      concatRows(reports, report => report.pm_by_month_year),
      ['year', 'month']
    ),
    pm_by_month_name: concatDedupeByFields(
      concatRows(reports, report => report.pm_by_month_name),
      ['month_name', 'year']
    ),
    site_monthly_mean_pm: concatDedupeByFields(
      concatRows(reports, report => report.site_monthly_mean_pm),
      ['site_name', 'year', 'month']
    ),
    site_annual_mean_pm: concatDedupeByFields(
      concatRows(reports, report => report.site_annual_mean_pm),
      ['site_name', 'year']
    ),
    site_mean_pm: weightedGroupAndAverage(
      collectWeightedRows(reports, report => report.site_mean_pm),
      siteKey
    ),
    mean_pm_by_city: concatDedupeByFields(
      concatRows(reports, report => report.mean_pm_by_city),
      ['city']
    ),
    mean_pm_by_country: concatDedupeByFields(
      concatRows(reports, report => report.mean_pm_by_country),
      ['country']
    ),
    mean_pm_by_region: concatDedupeByFields(
      concatRows(reports, report => report.mean_pm_by_region),
      ['region']
    ),
    mean_pm_by_day_of_week: weightedGroupAndAverage(
      collectWeightedRows(reports, report => report.mean_pm_by_day_of_week),
      dayKey
    ),
    mean_pm_by_day_hour: weightedGroupAndAverage(
      collectWeightedRows(reports, report => report.mean_pm_by_day_hour),
      dayHourKey
    ),
  };
};
