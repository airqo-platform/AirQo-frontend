import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { ManufacturerBadge } from "@/components/devices/manufacturer-badge"
import { DataSourceIndicator } from "@/components/devices/data-source-indicator"
import { describeManufacturerSelection } from "@/components/devices/manufacturer-filter"
import DeviceDetailsTab from "@/app/dashboard/devices/[id]/device-details-tab"

const render = (element) => renderToStaticMarkup(element)

test("ManufacturerBadge names the manufacturer and carries the raw network", () => {
  const html = render(React.createElement(ManufacturerBadge, { network: "airgradient" }))
  assert.match(html, />AirGradient</)
  assert.match(html, /data-network="airgradient"/)
  assert.match(render(React.createElement(ManufacturerBadge, { network: null })), />Unknown</)
})

test("DataSourceIndicator labels each source and treats unknown values as no data path", () => {
  assert.match(render(React.createElement(DataSourceIndicator, { dataSource: "thingspeak" })), /ThingSpeak/)
  assert.match(render(React.createElement(DataSourceIndicator, { dataSource: "external_api" })), /Mfr\. API/)
  const none = render(React.createElement(DataSourceIndicator, { dataSource: "none" }))
  assert.match(none, /No data/)
  assert.match(none, /aria-label="Data source: No data path"/)
  assert.match(render(React.createElement(DataSourceIndicator, { dataSource: "whatever" })), /data-data-source="none"/)
  const icon = render(React.createElement(DataSourceIndicator, { dataSource: "external_api", variant: "icon" }))
  assert.match(icon, /aria-label="Data source: Manufacturer API"/)
  assert.doesNotMatch(icon, /Mfr\. API/, "the icon variant has no text label")
})

test("describeManufacturerSelection summarises the filter", () => {
  assert.equal(describeManufacturerSelection([]), "All manufacturers")
  assert.equal(describeManufacturerSelection(["airqo"]), "AirQo")
  assert.equal(describeManufacturerSelection(["airqo", "iqair"]), "AirQo, IQAir")
  assert.equal(describeManufacturerSelection(["airqo", "iqair", "metone"]), "3 manufacturers")
})

const baseDevice = {
  _id: "dev-1",
  name: "device_1",
  long_name: "Device 1",
  network_id: "airgradient",
  category: "lowcost",
  category_hierarchy: [],
  cohorts: [],
  grids: [],
  rawOnlineStatus: true,
  latitude: 0.3,
  longitude: 32.5,
  beacon_data: { current_firmware: null },
}

const noop = () => {}

test("DeviceDetailsTab shows manufacturer connection details and hides ThingSpeak fields for external devices", () => {
  const html = render(
    React.createElement(DeviceDetailsTab, {
      device: {
        ...baseDevice,
        network: "airgradient",
        data_source: "external_api",
        serial_number: "AG-7000",
        api_code: "https://api.airgradient.com/public/api/v1/world/locations/7000/measures/current",
        authRequired: true,
        device_number: null,
      },
      copiedKey: null,
      copyToClipboard: noop,
      setUpdateDialogOpen: noop,
    })
  )
  assert.match(html, />AirGradient</)
  assert.match(html, /Serial Number/)
  assert.match(html, /AG-7000/)
  assert.match(html, /Connection URL/)
  assert.match(html, /api\.airgradient\.com/)
  assert.match(html, /Authentication Required/)
  assert.match(html, /needs the device credential/)
  assert.match(html, /Mfr\. API/)
  assert.doesNotMatch(html, /Read Key/)
  assert.doesNotMatch(html, /Write Key/)
  assert.doesNotMatch(html, /Device Number/)
})

test("DeviceDetailsTab keeps the channel and ThingSpeak keys for AirQo devices", () => {
  const html = render(
    React.createElement(DeviceDetailsTab, {
      device: {
        ...baseDevice,
        network: "airqo",
        network_id: "airqo",
        data_source: "thingspeak",
        device_number: 2084530,
        serial_number: "SN-1",
        readKey: "read-key-value",
        writeKey: "write-key-value",
      },
      copiedKey: null,
      copyToClipboard: noop,
      setUpdateDialogOpen: noop,
    })
  )
  assert.match(html, />AirQo</)
  assert.match(html, /Device Number/)
  assert.match(html, /2084530/)
  assert.match(html, /Read Key/)
  assert.match(html, /Write Key/)
  assert.doesNotMatch(html, /read-key-value/, "keys stay masked until revealed")
  assert.doesNotMatch(html, /Connection URL/)
})

test("DeviceDetailsTab explains a device with no data path", () => {
  const html = render(
    React.createElement(DeviceDetailsTab, {
      device: { ...baseDevice, network: "airly", data_source: "none", serial_number: "AL-1", device_number: null },
      copiedKey: null,
      copyToClipboard: noop,
      setUpdateDialogOpen: noop,
    })
  )
  assert.match(html, /No data/)
  assert.match(html, /no way to read this device yet/)
  assert.doesNotMatch(html, /Read Key/)
})
