import {
  extractQueryParams,
  isValidUrl,
  joinUrls,
  normalizeUrl,
} from "./urlHelpers";

describe("urlHelpers", () => {
  describe("normalizeUrl", () => {
    it("removes trailing slashes from full URLs and paths", () => {
      expect(normalizeUrl("https://api.airqo.net///")).toBe(
        "https://api.airqo.net"
      );
      expect(normalizeUrl("/api/v2/devices///")).toBe("/api/v2/devices");
    });

    it("returns an empty string for empty or non-string input", () => {
      expect(normalizeUrl("")).toBe("");
      expect(normalizeUrl(null as unknown as string)).toBe("");
    });
  });

  describe("joinUrls", () => {
    it("joins base URLs and paths with one slash", () => {
      expect(joinUrls("https://api.airqo.net/", "/devices")).toBe(
        "https://api.airqo.net/devices"
      );
    });

    it("returns the available side when base or path is empty", () => {
      expect(joinUrls("", "/devices")).toBe("devices");
      expect(joinUrls("https://api.airqo.net/", "")).toBe(
        "https://api.airqo.net"
      );
    });
  });

  describe("isValidUrl", () => {
    it("identifies valid absolute URLs", () => {
      expect(isValidUrl("https://api.airqo.net/devices")).toBe(true);
    });

    it("rejects relative paths and malformed URLs", () => {
      expect(isValidUrl("/api/devices")).toBe(false);
      expect(isValidUrl("not a url")).toBe(false);
    });
  });

  describe("extractQueryParams", () => {
    it("extracts query parameters into an object", () => {
      expect(
        extractQueryParams("https://api.airqo.net/devices?limit=10&sort=desc")
      ).toEqual({ limit: "10", sort: "desc" });
    });

    it("keeps the last value when query parameters are duplicated", () => {
      expect(extractQueryParams("https://airqo.net?a=1&a=2")).toEqual({
        a: "2",
      });
    });

    it("returns an empty object for invalid URLs", () => {
      expect(extractQueryParams("/devices?limit=10")).toEqual({});
    });
  });
});
