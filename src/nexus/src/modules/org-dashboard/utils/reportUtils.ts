import type {
  AnalyticsReport,
  AnalyticsReportAggregateRow,
} from '@/shared/types/api';
import type {
  NormalizedChartData,
  PollutantType,
} from '@/shared/components/charts/types';
import type { DateRange } from '@/shared/components/calendar';

export const REPORT_POLLUTANT_OPTIONS: {
  value: PollutantType;
  label: string;
}[] = [
  { value: 'pm2_5', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
];

const finiteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getPollutantValue = (
  row: AnalyticsReportAggregateRow,
  pollutant: PollutantType
): number | null =>
  finiteNumber(
    pollutant === 'pm2_5'
      ? row.pm2_5_calibrated_value
      : row.pm10_calibrated_value
  );

const getTimeKey = (row: AnalyticsReportAggregateRow): string => {
  const value = row.date ?? row.timestamp;
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const timestamp = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::\d{2})?(?:\.\d+)?(?:Z|\s+UTC)?$/i
  );
  return timestamp ? `${timestamp[1]}T${timestamp[2]}:00Z` : trimmed;
};

const ISO_DAY_PREFIX = /^\d{4}-\d{2}-\d{2}/;

const getRows = (rows: unknown): AnalyticsReportAggregateRow[] =>
  Array.isArray(rows) ? (rows as AnalyticsReportAggregateRow[]) : [];

const getPrimaryRows = (
  report: AnalyticsReport
): AnalyticsReportAggregateRow[] => {
  const dailyRows = getRows(report.daily_mean_pm);
  return dailyRows.length > 0 ? dailyRows : getRows(report.datetime_mean_pm);
};

const getAverage = (values: number[]): number | null => {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getMaximum = (values: number[]): number | null => {
  if (values.length === 0) return null;
  return Math.max(...values);
};

export const getReportPollutantLabel = (pollutant: PollutantType): string =>
  REPORT_POLLUTANT_OPTIONS.find(option => option.value === pollutant)?.label ??
  pollutant;

export const getReportDailySeries = (
  report: AnalyticsReport,
  pollutant: PollutantType
): NormalizedChartData[] => {
  const rows: Array<NormalizedChartData | null> = getPrimaryRows(report).map(
    row => {
      const time = getTimeKey(row);
      const value = getPollutantValue(row, pollutant);
      if (!time || value === null) return null;
      return {
        time,
        value,
        site: 'Cohort average',
        device_id: '',
        site_id: 'organization-report',
        rawTime: time,
      } satisfies NormalizedChartData;
    }
  );

  return rows
    .filter((row): row is NormalizedChartData => row !== null)
    .sort((left, right) => left.time.localeCompare(right.time));
};

export const getReportDiurnalSeries = (
  report: AnalyticsReport,
  pollutant: PollutantType
): NormalizedChartData[] => {
  const rows: Array<NormalizedChartData | null> = getRows(report.diurnal).map(
    row => {
      const hour = finiteNumber(row.hour);
      const value = getPollutantValue(row, pollutant);
      if (hour === null || value === null) return null;
      const time = `${String(hour).padStart(2, '0')}:00`;
      return {
        time,
        value,
        site: 'Typical hour',
        device_id: '',
        site_id: 'organization-report',
        rawTime: time,
      } satisfies NormalizedChartData;
    }
  );

  return rows
    .filter((row): row is NormalizedChartData => row !== null)
    .sort((left, right) => left.time.localeCompare(right.time));
};

export interface ReportSiteRow {
  name: string;
  value: number;
  latitude: number | null;
  longitude: number | null;
}

export const getReportSiteRows = (
  report: AnalyticsReport,
  pollutant: PollutantType
): ReportSiteRow[] => {
  return getRows(report.site_mean_pm)
    .map((row, index) => {
      const value = getPollutantValue(row, pollutant);
      if (value === null) return null;
      return {
        name: row.site_name?.trim() || `Site ${index + 1}`,
        value,
        latitude: finiteNumber(row.site_latitude),
        longitude: finiteNumber(row.site_longitude),
      } satisfies ReportSiteRow;
    })
    .filter((row): row is ReportSiteRow => row !== null)
    .sort((left, right) => right.value - left.value);
};

export interface ReportSummary {
  averagePm25: number | null;
  averagePm10: number | null;
  peakPm25: number | null;
  activeDays: number;
  deviceCount: number;
  siteCount: number;
}

export const getReportSummary = (report: AnalyticsReport): ReportSummary => {
  const primaryRows = getPrimaryRows(report);
  const pm25Values = primaryRows
    .map(row => getPollutantValue(row, 'pm2_5'))
    .filter((value): value is number => value !== null);
  const pm10Values = primaryRows
    .map(row => getPollutantValue(row, 'pm10'))
    .filter((value): value is number => value !== null);
  // Only day keys that look like an ISO date count: `getTimeKey` falls back
  // to the raw string, and a non-ISO backend timestamp must not inflate the
  // day count via a blind `.slice(0, 10)`.
  const activeDays = new Set(
    primaryRows
      .map(row => getTimeKey(row))
      .filter(time => ISO_DAY_PREFIX.test(time))
      .map(time => time.slice(0, 10))
  ).size;
  const siteCount = new Set(
    getRows(report.site_mean_pm)
      .map(row => row.site_name?.trim())
      .filter((name): name is string => Boolean(name))
  ).size;

  return {
    averagePm25: getAverage(pm25Values),
    averagePm10: getAverage(pm10Values),
    peakPm25: getMaximum(pm25Values),
    activeDays,
    deviceCount: finiteNumber(report.devices?.number_of_devices) ?? 0,
    siteCount,
  };
};

export const hasReportData = (report: AnalyticsReport | null): boolean => {
  if (!report) return false;
  return [
    report.daily_mean_pm,
    report.datetime_mean_pm,
    report.diurnal,
    report.annual_pm,
    report.monthly_pm,
    report.pm_by_month_year,
    report.pm_by_month_name,
    report.site_monthly_mean_pm,
    report.site_annual_mean_pm,
    report.site_mean_pm,
    report.mean_pm_by_city,
    report.mean_pm_by_country,
    report.mean_pm_by_region,
    report.mean_pm_by_day_of_week,
    report.mean_pm_by_day_hour,
  ].some(rows => Array.isArray(rows) && rows.length > 0);
};

export const formatReportValue = (value: number | null | undefined): string => {
  const numericValue = finiteNumber(value);
  if (numericValue === null) return '—';
  if (Math.abs(numericValue) >= 100) return numericValue.toFixed(0);
  return numericValue.toFixed(1);
};

/**
 * Builds the report request window from the LOCAL calendar dates the user
 * picked, so the payload's UTC calendar days are identical to the dates shown
 * in the picker, in every timezone.
 *
 * The backend accepts at most 27 inclusive UTC calendar dates. Converting
 * local start/end-of-day to UTC (as `DateUtils.formatRangeForBackend` does)
 * shifts the start into the previous UTC day for UTC+ timezones — a displayed
 * "Sep 1 – Sep 27" becomes Aug 31 → Sep 27 (28 UTC dates) and the API
 * responds with HTTP 400 "The requested date range is too wide."
 *
 * Both ends are additionally clamped to "now": the API rejects future
 * timestamps, and a UTC+ user's "today" is already the next UTC day. The
 * dashboard's own guard compares local instants, so only this payload-level
 * clamp prevents that nightly failure.
 */
export const getReportRequestRange = (
  range: DateRange
): { startDateTime: string; endDateTime: string } => {
  const utcCalendarDate = (date: Date | undefined, label: 'from' | 'to') => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error(`DateRange must have a valid ${label} date`);
    }
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const now = Date.now();
  const fromCalendarDate = utcCalendarDate(range.from, 'from');
  const toCalendarDate = utcCalendarDate(range.to, 'to');
  const requestedStart = Date.parse(`${fromCalendarDate}T00:00:00.000Z`);
  const requestedEnd = Date.parse(`${toCalendarDate}T23:59:59.999Z`);

  // The API rejects a future `start_time`/`end_time`, but the picker speaks
  // local calendar days while the payload carries UTC day boundaries. In a
  // UTC+ timezone, "today" midnight is already the next UTC day, so an
  // untouched value would be a future timestamp. Clamp both ends to now: the
  // report then covers the elapsed part of the period instead of failing.
  //
  // For a start that is *today* in the viewer's own timezone, use that day's
  // local midnight rather than its UTC-day boundary — otherwise a UTC+ viewer
  // selecting today gets a start after `now`, both ends clamp to the same
  // instant, and the range collapses to nothing.
  const localNow = new Date(now);
  const localTodayStart = new Date(localNow);
  localTodayStart.setHours(0, 0, 0, 0);
  const currentLocalDate = [
    localNow.getFullYear(),
    String(localNow.getMonth() + 1).padStart(2, '0'),
    String(localNow.getDate()).padStart(2, '0'),
  ].join('-');

  const startMs =
    fromCalendarDate === currentLocalDate
      ? Math.min(localTodayStart.getTime(), now)
      : Math.min(requestedStart, now);
  const endMs = Math.min(requestedEnd, now);
  // Clamping collapses the range only when the whole requested period is
  // still ahead of us (e.g. picking a future date). There is nothing to
  // report yet, and padding the window would only produce another future
  // timestamp for the API to reject.
  if (endMs <= startMs) {
    throw new Error(
      'The report period has not started yet. Choose an earlier date.'
    );
  }

  return {
    startDateTime: new Date(startMs).toISOString(),
    endDateTime: new Date(endMs).toISOString(),
  };
};
