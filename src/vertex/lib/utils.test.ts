import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, stripTrailingSlash, getElapsedDurationMapper } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    const cnCases = [
      { name: "merges classes", input: ["bg-red-500", "text-white"], expected: "bg-red-500 text-white" },
      { name: "handles conditional classes", input: ["bg-red-500", false && "text-white", true && "font-bold"], expected: "bg-red-500 font-bold" },
      { name: "resolves tailwind conflicts", input: ["px-2 py-1", "p-4"], expected: "p-4" },
    ];

    it.each(cnCases)("cn: $name", ({ input, expected }) => {
      expect(cn(...input)).toBe(expected);
    });
  });

  describe("stripTrailingSlash", () => {
    const slashCases = [
      { name: "no trailing slash", input: "http://example.com", expected: "http://example.com" },
      { name: "one trailing slash", input: "http://example.com/", expected: "http://example.com" },
      { name: "multiple trailing slashes", input: "http://example.com///", expected: "http://example.com" },
      { name: "path with slashes", input: "/api/v1/", expected: "/api/v1" },
      { name: "only slashes", input: "///", expected: "" },
    ];

    it.each(slashCases)("stripTrailingSlash: $name", ({ input, expected }) => {
      expect(stripTrailingSlash(input)).toBe(expected);
    });
  });

  describe("getElapsedDurationMapper", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const durationCases = [
      { name: "same time", input: "2024-01-01T12:00:00Z", expectedSeconds: 0, expectedResult: { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0 } },
      { name: "one minute ago", input: "2024-01-01T11:59:00Z", expectedSeconds: 60, expectedResult: { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 1, second: 0 } },
      { name: "one hour and 5 seconds ago", input: "2024-01-01T10:59:55Z", expectedSeconds: 3605, expectedResult: { year: 0, month: 0, week: 0, day: 0, hour: 1, minute: 0, second: 5 } },
      { name: "one day ago", input: "2023-12-31T12:00:00Z", expectedSeconds: 86400, expectedResult: { year: 0, month: 0, week: 0, day: 1, hour: 0, minute: 0, second: 0 } },
      { name: "future date (absolute value)", input: "2024-01-01T12:01:00Z", expectedSeconds: 60, expectedResult: { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 1, second: 0 } },
    ];

    it.each(durationCases)("getElapsedDurationMapper: $name", ({ input, expectedSeconds, expectedResult }) => {
      const [seconds, result] = getElapsedDurationMapper(input);
      expect(seconds).toBe(expectedSeconds);
      expect(result).toEqual(expectedResult);
    });
  });
});
