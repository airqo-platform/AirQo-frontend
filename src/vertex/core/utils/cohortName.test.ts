import {
  buildCohortName,
  sanitizeCohortInput,
  splitCohortName,
} from "./cohortName";

describe("cohortName utilities", () => {
  describe("sanitizeCohortInput", () => {
    it("removes non-alphanumeric characters while preserving case", () => {
      expect(sanitizeCohortInput(" Kampala-East 2026! ")).toBe(
        "KampalaEast2026"
      );
    });
  });

  describe("buildCohortName", () => {
    it("normalizes city, project, and optional funder segments", () => {
      expect(buildCohortName(" Kampala ", "Clean Air 2026", "UNICEF!")).toBe(
        "kampala_cleanair2026_unicef"
      );
    });

    it("omits empty optional segments", () => {
      expect(buildCohortName("Kigali", "Pilot", "")).toBe("kigali_pilot");
    });

    it("returns an empty string when all segments normalize to empty strings", () => {
      expect(buildCohortName("!!!", "   ", undefined)).toBe("");
    });
  });

  describe("splitCohortName", () => {
    it("splits city, project name, and funder segments", () => {
      expect(splitCohortName("kampala_school_air_unicef_phase2")).toEqual({
        city: "kampala",
        projectName: "school",
        funder: "air_unicef_phase2",
      });
    });

    it("ignores empty underscore segments and defaults missing values", () => {
      expect(splitCohortName("__kampala__")).toEqual({
        city: "kampala",
        projectName: "",
        funder: "",
      });
    });
  });
});
