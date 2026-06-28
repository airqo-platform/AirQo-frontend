import {
  badgeColorClasses,
  formatDisplayDate,
  getDeviceStatus,
  getSimpleStatus,
  getStatusExplanation,
} from "./status";

describe("status utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDisplayDate", () => {
    it("returns an invalid date error for unparseable values", () => {
      expect(formatDisplayDate("not-a-date")).toEqual({
        message: "Invalid date",
        isError: true,
        errorType: "invalid",
      });
    });

    it("allows dates within the five-minute future grace window", () => {
      expect(formatDisplayDate("2026-06-28T12:05:00.000Z")).toMatchObject({
        isError: false,
        errorType: null,
      });
    });

    it("marks dates beyond the five-minute future grace window as errors", () => {
      expect(formatDisplayDate("2026-06-28T12:06:00.000Z")).toMatchObject({
        isError: true,
        errorType: "future",
      });
    });

    it("formats valid current or past dates", () => {
      expect(formatDisplayDate("2026-06-28T11:30:00.000Z")).toMatchObject({
        isError: false,
        errorType: null,
      });
    });
  });

  describe("getSimpleStatus", () => {
    it("prioritizes invalid date errors over online state", () => {
      expect(
        getSimpleStatus(true, {
          message: "JUN 28 2026, 12:06 PM",
          isError: true,
          errorType: "future",
        })
      ).toMatchObject({
        label: "Invalid Date",
        color: "purple",
        description: "Reporting an invalid future date.",
      });
    });

    it("returns operational for online entities and not transmitting otherwise", () => {
      expect(getSimpleStatus(true)).toMatchObject({
        label: "Operational",
        color: "green",
      });
      expect(getSimpleStatus(false)).toMatchObject({
        label: "Not Transmitting",
        color: "gray",
      });
    });
  });

  describe("getDeviceStatus", () => {
    it("prioritizes invalid date errors over device state", () => {
      expect(
        getDeviceStatus(true, true, {
          message: "Invalid date",
          isError: true,
          errorType: "invalid",
        })
      ).toMatchObject({
        label: "Invalid Date",
        color: "purple",
        description: "Device reporting an invalid date.",
      });
    });

    it("returns operational when raw and calibrated data are online", () => {
      expect(getDeviceStatus(true, true)).toMatchObject({
        label: "Operational",
        color: "green",
      });
    });

    it("returns transmitting when raw data is online but calibrated data is offline", () => {
      expect(getDeviceStatus(false, true)).toMatchObject({
        label: "Transmitting",
        color: "blue",
      });
    });

    it("returns data available when raw data is offline but calibrated data is online", () => {
      expect(getDeviceStatus(true, false)).toMatchObject({
        label: "Data Available",
        color: "yellow",
      });
    });

    it("returns not transmitting for offline or unknown raw status", () => {
      expect(getDeviceStatus(false, false)).toMatchObject({
        label: "Not Transmitting",
        color: "gray",
      });
      expect(getDeviceStatus(false, undefined)).toMatchObject({
        label: "Not Transmitting",
        color: "gray",
      });
    });
  });

  describe("getStatusExplanation", () => {
    it("returns detailed explanations for each status label", () => {
      expect(getStatusExplanation("Operational")).toContain("Operational:");
      expect(getStatusExplanation("Transmitting")).toContain("Transmitting:");
      expect(getStatusExplanation("Data Available")).toContain("Data Available:");
      expect(getStatusExplanation("Not Transmitting")).toContain(
        "not sending new raw data"
      );
      expect(getStatusExplanation("Invalid Date")).toContain("not valid");
    });

    it("returns future and invalid date explanations when date checks fail", () => {
      expect(
        getStatusExplanation("Operational", {
          message: "JUN 28 2026, 12:06 PM",
          isError: true,
          errorType: "future",
        })
      ).toContain("invalid future date");

      expect(
        getStatusExplanation("Operational", {
          message: "Invalid date",
          isError: true,
          errorType: "invalid",
        })
      ).toContain("invalid date: Invalid date");
    });
  });

  it("exposes badge classes for every status color used by utilities", () => {
    expect(badgeColorClasses).toMatchObject({
      green: expect.any(String),
      blue: expect.any(String),
      yellow: expect.any(String),
      gray: expect.any(String),
      red: expect.any(String),
      purple: expect.any(String),
    });
  });
});
