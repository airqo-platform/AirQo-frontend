import { describe, expect, it } from "vitest";
import {
  formatLifecycleState,
  getBeaconUrl,
  getDailyUptime,
  getHealthWindow,
  getLastDayWithData,
  getLikelyCause,
  getUptimeBand,
  hasRecentData,
  isDiagnosisStale,
  sortDevicesByHealth,
} from "./beaconHealth";

const NOW = new Date(2026, 10, 6, 9, 0, 0);

describe("getHealthWindow", () => {
  it("covers the 14 days ending yesterday", () => {
    const { startDateTime, endDateTime } = getHealthWindow(NOW);

    expect(new Date(startDateTime)).toEqual(new Date(2026, 9, 23, 0, 0, 0, 0));
    expect(new Date(endDateTime)).toEqual(new Date(2026, 10, 5, 23, 59, 59, 999));
  });
});

describe("getUptimeBand", () => {
  it("uses Beacon's thresholds", () => {
    expect(getUptimeBand(75)).toBe("good");
    expect(getUptimeBand(74.9)).toBe("moderate");
    expect(getUptimeBand(50)).toBe("moderate");
    expect(getUptimeBand(49.9)).toBe("critical");
    expect(getUptimeBand(0)).toBe("no-data");
    expect(getUptimeBand(null)).toBe("no-data");
  });
});

describe("getDailyUptime", () => {
  const window = getHealthWindow(NOW);

  it("returns one entry per day, counting distinct hours", () => {
    const days = getDailyUptime(
      [
        { datetime: new Date(2026, 9, 23, 3, 0).toISOString() },
        { datetime: new Date(2026, 9, 23, 3, 30).toISOString() },
        { datetime: new Date(2026, 9, 23, 4, 0).toISOString() },
        { datetime: new Date(2026, 10, 5, 23, 0).toISOString() },
      ],
      window
    );

    expect(days).toHaveLength(14);
    expect(days[0].percent).toBeCloseTo((2 / 24) * 100);
    expect(days[1].percent).toBe(0);
    expect(days[13].percent).toBeCloseTo((1 / 24) * 100);
  });

  it("skips rows it can't date", () => {
    const days = getDailyUptime([{ datetime: "not a date" }], window);

    expect(days.every((day) => day.percent === 0)).toBe(true);
  });

  it("has no last day when nothing arrived", () => {
    expect(getLastDayWithData(getDailyUptime(undefined, window))).toBeNull();
  });

  it("finds the last day with a reading", () => {
    const days = getDailyUptime([{ datetime: new Date(2026, 9, 29, 8, 0).toISOString() }], window);

    expect(getLastDayWithData(days)).toEqual(new Date(2026, 9, 29));
  });
});

describe("diagnosis age", () => {
  it("accepts the day before yesterday, since diagnoses run overnight", () => {
    expect(isDiagnosisStale("2026-11-04", NOW)).toBe(false);
  });

  it("treats anything older as out of date", () => {
    expect(isDiagnosisStale("2026-11-03", NOW)).toBe(true);
  });

  it("doesn't call a missing date stale", () => {
    expect(isDiagnosisStale(null, NOW)).toBe(false);
  });

  it("applies the same limit to recent data", () => {
    expect(hasRecentData(new Date(2026, 10, 4), NOW)).toBe(true);
    expect(hasRecentData(new Date(2026, 10, 3), NOW)).toBe(false);
    expect(hasRecentData(null, NOW)).toBe(false);
  });
});

describe("getLikelyCause", () => {
  it("names a component fault the way people say it", () => {
    expect(getLikelyCause("Likely failure (25/100): device_battery (battery) fault (97%)")).toEqual({
      title: "Battery fault",
      confidence: 97,
    });
  });

  it("spells out sensors in other causes", () => {
    expect(getLikelyCause("Suspicious (60/100): pm_sensor1_2.5 and pm_sensor2_2.5 disagree (70%)")).toEqual({
      title: "PM2.5 sensor 1 and PM2.5 sensor 2 disagree",
      confidence: 70,
    });
  });

  it("finds nothing in a headline with no cause", () => {
    expect(getLikelyCause("Healthy (100/100)")).toBeNull();
    expect(getLikelyCause(null)).toBeNull();
  });
});

describe("formatLifecycleState", () => {
  it("reads as a sentence", () => {
    expect(formatLifecycleState("LIKELY_FAILURE")).toBe("Likely failure");
    expect(formatLifecycleState("HEALTHY")).toBe("Healthy");
  });
});

describe("sortDevicesByHealth", () => {
  it("puts the lowest health first and undiagnosed devices last", () => {
    const device = (name: string, score?: number) => ({
      device_id: name,
      device_name: name,
      diagnostics:
        score === undefined
          ? null
          : {
              diagnosis_date: "2026-11-02",
              overall_health_score: score,
              lifecycle_state: "HEALTHY" as const,
              issue_count: 0,
            },
    });

    const sorted = sortDevicesByHealth([device("none"), device("good", 90), device("bad", 20)]);

    expect(sorted.map((d) => d.device_name)).toEqual(["bad", "good", "none"]);
  });
});

describe("getBeaconUrl", () => {
  it("adds the group, and goes to staging away from production", () => {
    expect(getBeaconUrl("/dashboard/sites/s1", "my org")).toBe(
      "https://staging-beacon.airqo.net/dashboard/sites/s1?group=my%20org"
    );
  });

  it("leaves the group out when there is none", () => {
    expect(getBeaconUrl("/dashboard/sites/s1")).toBe("https://staging-beacon.airqo.net/dashboard/sites/s1");
  });
});
