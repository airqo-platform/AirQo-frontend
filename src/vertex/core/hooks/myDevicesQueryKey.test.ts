import { describe, it, expect } from "vitest";
import { isSameMyDevicesResultSet } from "./myDevicesQueryKey";

const key = (status: string | null, limit: number | null, skip: number | null) => [
  "myDevices",
  "user-1",
  "group-1",
  ["g1"],
  ["c1"],
  status,
  limit,
  skip,
];

describe("isSameMyDevicesResultSet", () => {
  it("treats a different page of the same filter as the same result set", () => {
    expect(isSameMyDevicesResultSet(key("transmitting", 25, 0), key("transmitting", 25, 25))).toBe(
      true
    );
  });

  it("treats a different status as a different result set", () => {
    expect(isSameMyDevicesResultSet(key("transmitting", 25, 0), key("operational", 25, 0))).toBe(
      false
    );
    expect(isSameMyDevicesResultSet(key(null, 25, 0), key("operational", 25, 0))).toBe(false);
  });

  it("treats a different user, group or cohort scope as a different result set", () => {
    const other = key("transmitting", 25, 0);
    other[1] = "user-2";
    expect(isSameMyDevicesResultSet(key("transmitting", 25, 0), other)).toBe(false);

    const otherCohorts = key("transmitting", 25, 0);
    otherCohorts[4] = ["c2"];
    expect(isSameMyDevicesResultSet(key("transmitting", 25, 0), otherCohorts)).toBe(false);
  });
});
