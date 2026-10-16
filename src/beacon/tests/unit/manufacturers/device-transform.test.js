import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import authService from "@/services/api-service"
import { deviceApiService } from "@/services/device-api.service"

const airqoDevice = {
  _id: "dev-airqo",
  name: "aq_g5401",
  network: "airqo",
  category: "lowcost",
  status: "deployed",
  device_number: 2084530,
  serial_number: "SN-1",
  data_source: "thingspeak",
  beacon_data: { network_id: "airqo", device_number: 2084530, data_source: "thingspeak", current_firmware: "v2" },
  last_reading: { timestamp: "2026-10-12T10:00:00Z", channel_id: "2084530", values: { field1: "12" } },
}

const externalDevice = {
  _id: "dev-ag",
  name: "airgradient_7000",
  network: "airgradient",
  category: "lowcost",
  status: "deployed",
  device_number: null,
  serial_number: "AG-7000",
  api_code: "https://api.airgradient.com/public/api/v1/world/locations/7000/measures/current",
  authRequired: true,
  data_source: "external_api",
  beacon_data: { network_id: "airgradient", device_number: null, serial_number: "AG-7000", data_source: "external_api" },
  // Local tables key other manufacturers' readings by device id, which is not a ThingSpeak channel
  last_reading: { timestamp: "2026-10-12T10:00:00Z", channel_id: "dev-ag", values: { field1: "9" } },
}

const legacyDevice = {
  _id: "dev-legacy",
  name: "aq_old",
  network: "airqo",
  category: "lowcost",
  status: "deployed",
  device_number: 1500000,
  beacon_data: { network_id: "airqo", device_number: 1500000 },
}

test("transformDeviceListToUI keeps the manufacturer identity and only ThingSpeak devices get a channel", () => {
  const [airqo, external, legacy] = deviceApiService.transformDeviceListToUI([airqoDevice, externalDevice, legacyDevice])

  assert.equal(airqo.device_id, "dev-airqo")
  assert.equal(airqo.network, "airqo")
  assert.equal(airqo.data_source, "thingspeak")
  assert.equal(airqo.channel_id, 2084530)
  assert.equal(airqo.serial_number, "SN-1")

  assert.equal(external.device_id, "dev-ag", "the device identity is _id, never device_number")
  assert.equal(external.network, "airgradient")
  assert.equal(external.data_source, "external_api")
  assert.equal(external.channel_id, 0, "no ThingSpeak channel for other manufacturers")
  assert.equal(external.serial_number, "AG-7000")
  assert.equal(external.api_code, externalDevice.api_code)
  assert.equal(external.auth_required, true)
  assert.equal(external.reading_timestamp, "2026-10-12T10:00:00Z")

  // Older beacon-api builds send no data_source: an AirQo device with a channel still reads from ThingSpeak
  assert.equal(legacy.data_source, "thingspeak")
  assert.equal(legacy.channel_id, 1500000)
})

test("getDevicesPaginated passes the comma-separated network filter through to /devices/synced", async () => {
  authService.getToken = () => null
  let requested = ""
  globalThis.fetch = async (url) => {
    requested = String(url)
    return new Response(
      JSON.stringify({
        success: true,
        message: "ok",
        meta: { total: 1, limit: 25, skip: 0, page: 1, totalPages: 1, nextPage: null, totalDevices: 1 },
        devices: [externalDevice],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  const result = await deviceApiService.getDevicesPaginated({ group: "airqo", network: "airqo,airgradient", limit: 25, skip: 0 })

  assert.match(requested, /\/devices\/synced\?/)
  assert.match(requested, /(^|[?&])network=airqo%2Cairgradient(&|$)/)
  assert.match(requested, /(^|[?&])group=airqo(&|$)/)
  assert.equal(result.devices.length, 1)
  assert.equal(result.meta.totalDevices, 1)
})
