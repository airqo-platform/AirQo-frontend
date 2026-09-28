import type { UsageKind } from '@/shared/types/usage';

/**
 * Pure formatting helpers for the platform Usage dashboard (M2).
 *
 * Kept dependency-free and side-effect-free so they are trivially unit-testable
 * and reusable across the overview / pages / users / retention sections.
 */

/** Default dash used in place of unavailable data. */
export const DASH = '—';

const numberFormatter = new Intl.NumberFormat('en-US');

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
});

const signedIntFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  signDisplay: 'always',
});

/** Formats an integer with locale grouping. Returns DASH for null/undefined. */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return DASH;
  }
  return numberFormatter.format(value);
};

/**
 * Formats a percentage value (already a percent, e.g. 42 means 42%) with one
 * decimal, no sign. Returns DASH for null/undefined.
 */
export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return DASH;
  }
  return `${Number(value).toFixed(1)}%`;
};

/**
 * Formats a month-over-month change percentage with a sign (e.g. "+12%" or
 * "-3%"). Returns DASH for null/undefined rather than inventing "0%" — a null
 * change means the comparison baseline is missing, not that nothing changed.
 */
export const formatPercentChange = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return DASH;
  }
  return percentFormatter.format(value / 100);
};

/** Formats a signed integer delta (e.g. "+5" or "-2") for KPI badges. */
export const formatSignedInt = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return DASH;
  }
  return signedIntFormatter.format(value);
};

/**
 * Formats a duration in seconds into a compact human string:
 * - < 60s       -> "45s"
 * - < 60m       -> "5m 30s"
 * - < 24h       -> "2h 15m"
 * - otherwise   -> "1d 4h"
 */
export const formatDurationSec = (
  seconds: number | null | undefined
): string => {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return DASH;
  }
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) {
    return `${total}s`;
  }
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins < 60) {
    return secs ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) {
    return remMins ? `${hours}h ${remMins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours ? `${days}d ${remHours}h` : `${days}d`;
};

/**
 * Builds the canonical CSV export filename: "nexus-usage-<month>.csv", falling
 * back to the current UTC month when an absent/empty month is passed.
 */
export const formatCsvFilename = (month: string | null | undefined): string => {
  const safe =
    typeof month === 'string' && /^\d{4}-\d{2}$/.test(month.trim())
      ? month.trim()
      : currentUtcMonth();
  return `nexus-usage-${safe}.csv`;
};

/**
 * Maps a retention rate (0-100, or null) to a Tailwind intensity class that is
 * readable in BOTH light and dark themes. Uses `color-mix` with the CSS
 * variable `--primary` so the hue tracks the active theme. Null rates return a
 * neutral muted class (rendered as "—" by the caller).
 */
export const retentionColorClass = (
  rate: number | null | undefined
): string => {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) {
    return 'bg-muted/40 text-muted-foreground';
  }
  const clamped = Math.max(0, Math.min(100, rate));
  // Intensity buckets (coarse for accessibility — never color-only meaning,
  // the numeric label is always rendered in the cell).
  if (clamped < 20) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_10%,transparent)] text-foreground';
  }
  if (clamped < 40) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_25%,transparent)] text-foreground';
  }
  if (clamped < 60) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_40%,transparent)] text-foreground';
  }
  if (clamped < 80) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_60%,transparent)] text-white dark:text-foreground';
  }
  return 'bg-[color-mix(in_srgb,rgb(var(--primary))_80%,transparent)] text-white dark:text-foreground';
};

/** The current UTC month in "YYYY-MM" form. */
export const currentUtcMonth = (): string => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/** Today's UTC date as "YYYY-MM-DD", used to disable future months in the UI. */
export const currentUtcDate = (): string => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Returns the "YYYY-MM" string for a Date, in UTC. */
export const toUtcMonth = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/**
 * Resolves a calendar pick into the canonical "YYYY-MM" month selection.
 *
 * The dashboard is month-granular, so any picked day normalises to its month
 * ("Sep 15" and "Sep 1" are the same selection — the pick is never dropped
 * for landing on a different day of the already-selected month). A pick in a
 * month after `maxMonth` (default: the current UTC month) is CLAMPED to
 * `maxMonth` and still applied — future selections are never silently
 * ignored, the dashboard always updates.
 *
 * Month extraction uses LOCAL calendar fields because the shared DatePicker
 * emits local Dates (its trigger formats with local date-fns); the clamp
 * bound is the current UTC month, matching the backend's reporting month.
 */
export const resolveMonthSelection = (
  date: Date,
  maxMonth: string = currentUtcMonth()
): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const picked = `${y}-${m}`;
  return picked > maxMonth ? maxMonth : picked;
};

/**
 * Resolves a calendar pick into the canonical "YYYY-MM-DD" date selection.
 *
 * The timeline is day-granular; any picked day is returned in ISO date form.
 * A pick after `maxDate` (default: the current UTC date) is CLAMPED to
 * `maxDate` and still applied — future selections are never silently ignored,
 * the timeline always updates to the latest available day. Date extraction
 * uses LOCAL calendar fields because the shared DatePicker emits local Dates
 * (its trigger formats with local date-fns); the clamp bound is the current
 * UTC date, matching the backend's reporting day.
 */
export const resolveDateSelection = (
  date: Date,
  maxDate: string = currentUtcDate()
): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const picked = `${y}-${m}-${d}`;
  return picked > maxDate ? maxDate : picked;
};

/** Validates and normalises a kind value, defaulting safely. */
export const normalizeKind = (kind: string | null | undefined): UsageKind => {
  return kind === 'api' ? 'api' : 'page';
};

// ---------------------------------------------------------------------------
// Retention cell display model
// ---------------------------------------------------------------------------

export interface RetentionCellView {
  /** Visible cell text. */
  text: string;
  /** Accessible label (exposed via aria-label/title). */
  label: string;
  /** True for the M+0 acquisition-month baseline column. */
  isBaseline: boolean;
}

/**
 * Builds the display model for one retention matrix cell.
 *
 * M+0 (offset 0) is the acquisition-month baseline and MUST render the cohort
 * size — a count of users — never a percentage rate (the M+0 "rate" is a
 * tautology and reads like 100% retention). Offsets > 0 are nullable
 * percentages: null renders as DASH ("—"), because "unknown" ≠ "0%".
 */
export const retentionCellView = (
  offset: number,
  cohortSize: number | null | undefined,
  ratePct: number | null | undefined
): RetentionCellView => {
  if (offset === 0) {
    const sizeAvailable =
      cohortSize !== null &&
      cohortSize !== undefined &&
      Number.isFinite(cohortSize);
    const sizeText = sizeAvailable ? formatNumber(cohortSize) : DASH;
    return {
      text: sizeText,
      label: sizeAvailable
        ? `Baseline cohort size: ${sizeText} users (acquisition month)`
        : 'Baseline cohort size unavailable (acquisition month)',
      isBaseline: true,
    };
  }
  const text = formatPercent(ratePct);
  return {
    text,
    label: text === DASH ? 'No data' : `${text} of cohort returned`,
    isBaseline: false,
  };
};

// ---------------------------------------------------------------------------
// Users-table pagination model
// ---------------------------------------------------------------------------

export interface UsersPagination {
  currentPage: number;
  totalPages: number;
  prevPage: number;
  nextPage: number;
  summary: string;
}

/**
 * Pure pagination model for the users table.
 *
 * `page` is the PARENT-OWNED current page and is the only source of truth for
 * the current/prev/next targets. The response payload's echoed `page` must
 * never be used here: `placeholderData: keepPreviousData` serves stale data
 * after a filter reset, so a response built for page 4 can still be on screen
 * while the parent has already reset to page 1.
 */
export const usersPagination = (
  page: number,
  pageSize: number,
  totalItems: number,
  responsePages?: number | null
): UsersPagination => {
  const size = Math.max(1, pageSize || 1);
  const total = Math.max(0, totalItems || 0);
  const totalPages = Math.max(
    1,
    responsePages && responsePages > 0
      ? Math.floor(responsePages)
      : Math.ceil(total / size)
  );
  const currentPage = Math.max(1, Math.floor(page) || 1);
  return {
    currentPage,
    totalPages,
    prevPage: Math.max(1, currentPage - 1),
    nextPage: Math.min(totalPages, currentPage + 1),
    summary: `${total} user${total === 1 ? '' : 's'} · page ${currentPage} of ${totalPages}`,
  };
};

// ---------------------------------------------------------------------------
// Sparkline geometry
// ---------------------------------------------------------------------------

export interface SparklineBar {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SPARKLINE_GAP = 1;
const SPARKLINE_MIN_BAR = 1;

/**
 * Deterministic downsampling by per-bucket maxima (peaks survive, and the same
 * input always yields the same output — no randomness, no floating sampling).
 * Returns a copy unchanged when already short enough.
 */
export const downsampleMax = (
  values: readonly number[],
  targetLength: number
): number[] => {
  const n = values.length;
  const m = Math.max(1, Math.min(targetLength, n));
  if (m >= n) return values.slice();
  const out: number[] = [];
  for (let i = 0; i < m; i++) {
    const start = Math.floor((i * n) / m);
    const end = Math.max(start + 1, Math.floor(((i + 1) * n) / m));
    let bucketMax = 0;
    for (let j = start; j < end && j < n; j++) {
      const v = values[j] ?? 0;
      if (v > bucketMax) bucketMax = v;
    }
    out.push(bucketMax);
  }
  return out;
};

/**
 * Computes sparkline bar rectangles that ALWAYS stay inside the
 * `width x height` viewBox, for every input length.
 *
 * Long series are deterministically downsampled (bucket maxima) to the number
 * of bars that physically fit (>= 1px bar + 1px gap each); bar sizes are then
 * clamped again so x + width <= width and y + height <= height regardless of
 * rounding. Values are sanitized to finite, non-negative numbers.
 */
export const computeSparklineBars = (
  values: readonly (number | null | undefined)[] | null | undefined,
  width: number,
  height: number
): SparklineBar[] => {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const cleaned = Array.from(values ?? [], v =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0
  );
  const series = cleaned.length > 0 ? cleaned : [0];

  // Bars need at least SPARKLINE_MIN_BAR px each plus SPARKLINE_GAP between
  // neighbours: m * MIN + (m - 1) * GAP <= w  <=>  m <= (w + GAP) / (MIN + GAP).
  const maxBars = Math.max(
    1,
    Math.floor((w + SPARKLINE_GAP) / (SPARKLINE_MIN_BAR + SPARKLINE_GAP))
  );
  const sampled = downsampleMax(series, maxBars);
  const m = sampled.length;

  let peak = 1;
  for (const v of sampled) {
    if (v > peak) peak = v;
  }

  const idealWidth = (w - (m - 1) * SPARKLINE_GAP) / m;
  const barWidth = Math.max(SPARKLINE_MIN_BAR, idealWidth);

  return sampled.map((v, i) => {
    const x = Math.min(
      i * (barWidth + SPARKLINE_GAP),
      Math.max(0, w - SPARKLINE_MIN_BAR)
    );
    const bw = Math.max(SPARKLINE_MIN_BAR, Math.min(barWidth, w - x));
    const bh = Math.max(1, Math.min(h, (v / peak) * h));
    return { x, y: h - bh, width: bw, height: bh };
  });
};
