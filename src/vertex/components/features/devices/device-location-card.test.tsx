import { describe, it, expect } from "vitest";
import { hasDeviceLocation } from "./device-location-card";
import { Device } from "@/app/types/devices";

const device = (overrides: Partial<Device>) => ({ name: "aq_1", ...overrides }) as Device;

describe("hasDeviceLocation", () => {
  it("is false when the device has no site and no coordinates", () => {
    expect(hasDeviceLocation(device({}))).toBe(false);
    expect(hasDeviceLocation(device({ site: [], latitude: null, longitude: "" }))).toBe(false);
  });

  it("treats whitespace-only coordinates as missing", () => {
    expect(hasDeviceLocation(device({ latitude: "  ", longitude: " " }))).toBe(false);
  });

  it("is true when the device sits at a site", () => {
    expect(hasDeviceLocation(device({ site: [{ _id: "s1", name: "Kampala" } as never] }))).toBe(true);
    expect(hasDeviceLocation(device({ site: { _id: "s1", name: "Kampala" } }))).toBe(true);
  });

  it("is true when the device has coordinates but no site", () => {
    expect(hasDeviceLocation(device({ latitude: "0.3476", longitude: 32.5825 }))).toBe(true);
  });

  it("needs both coordinates", () => {
    expect(hasDeviceLocation(device({ latitude: 0.3476 }))).toBe(false);
  });
});
