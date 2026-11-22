import test from "node:test"
import assert from "node:assert/strict"

import {
  buildNetworkFilterOptions,
  formatNetworkLabel,
  getDeviceSourceIdentifier,
  matchesNetworkFilter,
  parseNetworkFilter,
  resolveDeviceDataSource,
  serializeNetworkFilter,
  toggleNetworkSelection,
} from "@/lib/manufacturers"

test("formatNetworkLabel names known manufacturers and title-cases the rest", () => {
  assert.equal(formatNetworkLabel("acme"), "Acme Sensors")
  assert.equal(formatNetworkLabel("Nimbus"), "Nimbus Labs")
  assert.equal(formatNetworkLabel("quant-aq"), "Quant Aq")
  assert.equal(formatNetworkLabel("terra"), "TerraSense")
  assert.equal(formatNetworkLabel("some_new vendor"), "Some New Vendor")
  assert.equal(formatNetworkLabel(""), "Unknown")
  assert.equal(formatNetworkLabel(null), "Unknown")
})

test("resolveDeviceDataSource trusts the API and falls back for older builds", () => {
  assert.equal(resolveDeviceDataSource({ data_source: "external_api", device_number: 123 }), "external_api")
  assert.equal(resolveDeviceDataSource({ beacon_data: { data_source: "none" }, device_number: 123 }), "none")
  // Older beacon-api: no data_source, a device with a channel reads from ThingSpeak
  assert.equal(resolveDeviceDataSource({ device_number: 2084530 }), "thingspeak")
  assert.equal(resolveDeviceDataSource({ beacon_data: { device_number: 2084530 } }), "thingspeak")
  // No channel and no data_source: nothing to read
  assert.equal(resolveDeviceDataSource({ serial_number: "AG-1" }), "none")
  assert.equal(resolveDeviceDataSource({ data_source: "mystery", device_number: null }), "none")
  assert.equal(resolveDeviceDataSource(null), "none")
})

test("getDeviceSourceIdentifier shows the channel for ThingSpeak devices and the serial otherwise", () => {
  assert.deepEqual(getDeviceSourceIdentifier({ data_source: "thingspeak", device_number: 2084530, serial_number: "SN-1" }), {
    label: "Channel ID",
    value: "2084530",
  })
  assert.deepEqual(getDeviceSourceIdentifier({ data_source: "external_api", serial_number: "AG-7000", device_number: null }), {
    label: "Serial Number",
    value: "AG-7000",
  })
  assert.deepEqual(getDeviceSourceIdentifier({ data_source: "none", beacon_data: { serial_number: "IQ-1" } }), {
    label: "Serial Number",
    value: "IQ-1",
  })
  assert.equal(getDeviceSourceIdentifier({ data_source: "none" }), null)
})

test("network filter values round-trip through the comma-separated query parameter", () => {
  assert.deepEqual(parseNetworkFilter("Acme, terra,,ACME"), ["acme", "terra"])
  assert.equal(serializeNetworkFilter(["acme", "Terra"]), "acme,terra")
  assert.equal(serializeNetworkFilter([]), undefined)
  assert.equal(serializeNetworkFilter(null), undefined)
})

test("toggleNetworkSelection adds and removes manufacturers without duplicates", () => {
  assert.deepEqual(toggleNetworkSelection([], "Acme", true), ["acme"])
  assert.deepEqual(toggleNetworkSelection(["acme"], "acme", true), ["acme"])
  assert.deepEqual(toggleNetworkSelection(["acme", "nimbus"], "acme", false), ["nimbus"])
  assert.deepEqual(toggleNetworkSelection(["acme"], "", true), ["acme"])
})

test("matchesNetworkFilter is case-insensitive and empty means everything", () => {
  assert.equal(matchesNetworkFilter("Acme", []), true)
  assert.equal(matchesNetworkFilter("Acme", ["acme"]), true)
  assert.equal(matchesNetworkFilter("nimbus", ["acme"]), false)
  assert.equal(matchesNetworkFilter(undefined, ["acme"]), false)
})

test("buildNetworkFilterOptions merges case variants and sorts busiest first", () => {
  const options = buildNetworkFilterOptions([
    { network_id: "1", name: "terra", enabled: true, total_devices: 12, deployed_devices: 0, online_devices: 0, thingspeak_devices: 0, external_api_devices: 12 },
    { network_id: "2", name: "acme", enabled: true, total_devices: 700, deployed_devices: 0, online_devices: 0, thingspeak_devices: 700, external_api_devices: 0 },
    { network_id: null, name: "Terra", enabled: false, total_devices: 1, deployed_devices: 0, online_devices: 0, thingspeak_devices: 0, external_api_devices: 0 },
    { network_id: "3", name: "airly", enabled: true, total_devices: 0, deployed_devices: 0, online_devices: 0, thingspeak_devices: 0, external_api_devices: 0 },
  ])
  assert.deepEqual(
    options.map((o) => [o.value, o.label, o.count, o.enabled]),
    [
      ["acme", "Acme Sensors", 700, true],
      ["terra", "TerraSense", 13, true],
      ["airly", "Airly", 0, true],
    ]
  )
  assert.deepEqual(buildNetworkFilterOptions(null), [])
})

test("buildNetworkFilterOptionsFromDevices counts devices per manufacturer", async () => {
  const { buildNetworkFilterOptionsFromDevices } = await import("@/lib/manufacturers")
  const options = buildNetworkFilterOptionsFromDevices([
    { network: "acme" },
    { network: "Acme" },
    { network: "nimbus" },
    { network: "" },
    { network: null },
  ])
  assert.deepEqual(
    options.map((o) => [o.value, o.label, o.count]),
    [
      ["acme", "Acme Sensors", 2],
      ["nimbus", "Nimbus Labs", 1],
    ]
  )
  assert.deepEqual(buildNetworkFilterOptionsFromDevices(undefined), [])
})

test("pruneNetworkSelection drops manufacturers the organisation doesn't have", async () => {
  const { pruneNetworkSelection } = await import("@/lib/manufacturers")
  const options = [
    { value: "acme", label: "Acme Sensors", count: 15, enabled: true },
    { value: "terra", label: "TerraSense", count: 2, enabled: true },
  ]
  const unchanged = ["acme", "terra"]
  assert.equal(pruneNetworkSelection(unchanged, options), unchanged, "same reference when nothing is dropped")
  assert.deepEqual(pruneNetworkSelection(["acme", "nimbus"], options), ["acme"])
  assert.deepEqual(pruneNetworkSelection(["Nimbus"], options), [])
  assert.deepEqual(pruneNetworkSelection(["acme"], []), [])
  const empty = []
  assert.equal(pruneNetworkSelection(empty, options), empty)
})
