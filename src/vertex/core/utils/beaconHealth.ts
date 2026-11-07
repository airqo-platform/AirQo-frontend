import axios from "axios";
import { addDays, differenceInCalendarDays, endOfDay, format, isValid, parseISO, startOfDay } from "date-fns";
import type {
  BeaconHealthDevice,
  BeaconLifecycleState,
  BeaconReadingRow,
} from "@/app/types/beacon";
import { getEnvironmentAwareUrl } from "@/core/urls";
import { stripTrailingSlash } from "@/lib/utils";

export const HEALTH_WINDOW_DAYS = 14;

// Beacon writes a device-day's diagnosis overnight, so the day before yesterday is still current.
const MAX_DIAGNOSIS_AGE_DAYS = 2;

export interface HealthWindow {
  startDateTime: string;
  endDateTime: string;
}

export interface DailyUptime {
  date: Date;
  percent: number;
}

export type UptimeBand = "good" | "moderate" | "critical" | "no-data";

/**
 * 14 days ending yesterday, the same window as Beacon's Sites page. Ending before today also stops
 * /devices/performance refreshing the device's readings on every Vertex page view.
 */
export const getHealthWindow = (now: Date = new Date()): HealthWindow => {
  const lastDay = addDays(now, -1);
  return {
    startDateTime: startOfDay(addDays(lastDay, 1 - HEALTH_WINDOW_DAYS)).toISOString(),
    endDateTime: endOfDay(lastDay).toISOString(),
  };
};

/** The same thresholds as Beacon's uptime scale. */
export const getUptimeBand = (uptime?: number | null): UptimeBand => {
  if (uptime === null || uptime === undefined || uptime <= 0) return "no-data";
  if (uptime >= 75) return "good";
  return uptime >= 50 ? "moderate" : "critical";
};

/** One entry per day of the window: the share of its hours that had a reading. */
export const getDailyUptime = (
  rows: BeaconReadingRow[] | undefined,
  window: HealthWindow
): DailyUptime[] => {
  const hoursByDay = new Map<string, Set<number>>();
  for (const { datetime } of rows ?? []) {
    const time = new Date(datetime);
    if (!isValid(time)) continue;
    const day = format(time, "yyyy-MM-dd");
    const hours = hoursByDay.get(day) ?? new Set<number>();
    hours.add(time.getHours());
    hoursByDay.set(day, hours);
  }

  const start = new Date(window.startDateTime);
  return Array.from({ length: HEALTH_WINDOW_DAYS }, (_, index) => {
    const date = addDays(start, index);
    const hours = hoursByDay.get(format(date, "yyyy-MM-dd"))?.size ?? 0;
    return { date, percent: (hours / 24) * 100 };
  });
};

export const getLastDayWithData = (days: DailyUptime[]): Date | null =>
  [...days].reverse().find((day) => day.percent > 0)?.date ?? null;

export const isDiagnosisStale = (diagnosisDate?: string | null, now: Date = new Date()): boolean => {
  if (!diagnosisDate) return false;
  return differenceInCalendarDays(now, parseISO(diagnosisDate)) > MAX_DIAGNOSIS_AGE_DAYS;
};

/** True while the device's latest day with data is recent enough to still be awaiting a diagnosis. */
export const hasRecentData = (lastDay: Date | null, now: Date = new Date()): boolean =>
  lastDay !== null && differenceInCalendarDays(now, lastDay) <= MAX_DIAGNOSIS_AGE_DAYS;

/** "2026-11-02" or a Date → "2 Nov". */
export const formatHealthDate = (date: string | Date): string =>
  format(typeof date === "string" ? parseISO(date) : date, "d MMM");

/** " on 29 Oct" for a diagnosis too old to present as current, otherwise nothing. */
export const getDiagnosisAsOf = (diagnosisDate?: string | null, now: Date = new Date()): string =>
  diagnosisDate && isDiagnosisStale(diagnosisDate, now) ? ` on ${formatHealthDate(diagnosisDate)}` : "";

/** "LIKELY_FAILURE" → "Likely failure". */
export const formatLifecycleState = (state: BeaconLifecycleState): string => {
  const words = state.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The likely cause in a diagnosis headline, as people say it:
 * "Likely failure (25/100): device_battery (battery) fault (97%)" → Battery fault, 97.
 */
export const getLikelyCause = (
  headline?: string | null
): { title: string; confidence: number } | null => {
  const match = /^[^:]+:\s*(.+?)\s*\((\d+)%\)$/.exec(headline?.trim() ?? "");
  if (!match) return null;

  const [, cause, confidence] = match;
  const component = /^\S+ \(([^)]+)\) (.+)$/.exec(cause);
  const title = component
    ? `${component[1]} ${component[2]}`
    : cause.replace(/pm_sensor(\d)_([\d.]+)/g, "PM$2 sensor $1");
  return { title: title.charAt(0).toUpperCase() + title.slice(1), confidence: Number(confidence) };
};

/** Lowest health first, then devices with no diagnosis. */
export const sortDevicesByHealth = (devices: BeaconHealthDevice[]): BeaconHealthDevice[] =>
  [...devices].sort(
    (a, b) =>
      (a.diagnostics?.overall_health_score ?? Infinity) -
      (b.diagnostics?.overall_health_score ?? Infinity)
  );

/** A site or cohort Beacon hasn't synced from the platform yet. */
export const isNotInBeacon = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const getBeaconUrl = (path: string, group?: string): string => {
  const base = stripTrailingSlash(getEnvironmentAwareUrl("https://beacon.airqo.net"));
  return `${base}${path}${group ? `?group=${encodeURIComponent(group)}` : ""}`;
};
