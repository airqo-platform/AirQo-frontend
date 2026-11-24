import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { handleMockRequest } from "@/lib/mock"
import { COHORTS, DEVICES, SITES } from "@/lib/mock/fleet"
import { DEMO_GROUPS, DEMO_USER } from "@/lib/mock/identity"

// The mock backend has to answer every request the pages make, with the fields they read.
// It's the contract a real backend has to meet, so a page that starts calling something new
// should add it here.

const call = async (api, path, query = {}, method = "GET", body = null) => {
  const response = await handleMockRequest(api, method, path, new URLSearchParams(query), body)
  return { status: response.status, body: await response.json() }
}

const device = DEVICES.find((d) => d.network === "acme" && d.status === "deployed")
const partner = DEMO_GROUPS[1].grp_title
const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const BEACON_READS = [
  ["devices/synced", { limit: "25", includeDiagnostics: "true" }, "devices"],
  ["devices/synced", { includePerformance: "true", limit: "5" }, "devices"],
  [`devices/${device._id}`, {}, "data"],
  ["devices", {}, "devices"],
  ["devices/performance", { device_name: device.name }, "data"],
  [`devices/${device.name}/metadata/lowcost`, { limit: "5" }, "beacon_data"],
  [`devices/${device.name}/configdata/lowcost`, {}, "beacon_data"],
  ["data-sync/raw", { channel_id: String(device.device_number), limit: "10" }, "data"],
  ["cohorts", { limit: "100" }, "cohorts"],
  ["cohorts/synced", { includePerformance: "true", includeSeries: "false", includeDevices: "false", includeDiagnostics: "true" }, "cohorts"],
  [`cohorts/synced/${COHORTS[1]._id}`, { includePerformance: "true" }, "cohort"],
  ["sites/summary", {}, "summary"],
  ["sites", { includePerformance: "true", includeSeries: "false", limit: "10" }, "sites"],
  [`sites/${SITES[0]._id}`, { includeDiagnostics: "true" }, "site"],
  ["grids/synced", { limit: "20" }, "grids"],
  ["maintenance/map-view/synced", { days: "14" }, "data"],
  ["maintenance/map-view/sites/synced", { days: "14" }, "data"],
  ["networks", { include_counts: "true" }, "networks"],
  ["networks/profiles", {}, "profiles"],
  ["diagnostics/profiles", { limit: "500" }, null],
  ["diagnostics/templates", {}, null],
  ["status-code-sets", { limit: "500" }, null],
  [`diagnostics/devices/${device._id}/daily`, { limit: "14" }, null],
  [`diagnostics/devices/${device._id}/issues`, { days: "13" }, null],
  ["diagnostics/fleet/daily-summary", { top_n: "10" }, null],
  ["diagnostics/fleet/issues", { diagnosis_date: day, limit: "1000" }, null],
  ["users/me", {}, "email"],
  ["firmware", {}, null],
]

for (const [path, query, key] of BEACON_READS) {
  test(`Beacon API: GET ${path}`, async () => {
    const { status, body } = await call("beacon", `api/v1/${path}`, query)
    assert.equal(status, 200, JSON.stringify(body).slice(0, 200))
    if (key) assert.ok(body[key] !== undefined, `missing "${key}"`)
  })
}

const PLATFORM_READS = [
  [`users/${DEMO_USER._id}`, {}, "users"],
  ["users/theme", {}, "data"],
  ["users/groups/discover", {}, "groups"],
  [`users/${DEMO_USER._id}/cohorts`, {}, "cohorts"],
  ["devices/my-devices", { cohort_ids: "c00000010000000000000099" }, "devices"],
  ["devices/network-status", { limit: "200" }, "alerts"],
  ["devices/network-status/statistics", {}, "statistics"],
  ["devices/network-status/trends/hourly", {}, "trends"],
  ["devices/network-status/uptime-summary", { days: "14" }, "summary"],
  ["devices/network-status/recent", { hours: "48" }, "alerts"],
  ["devices/network-status/breakdown", {}, "data"],
  ["devices/network-status/breakdown/cohorts", {}, "data"],
  ["devices/summary/count", { network: "acme" }, "data"],
]

for (const [path, query, key] of PLATFORM_READS) {
  test(`platform API: GET ${path}`, async () => {
    const { status, body } = await call("platform", `api/v2/${path}`, query)
    assert.equal(status, 200, JSON.stringify(body).slice(0, 200))
    assert.ok(body[key] !== undefined, `missing "${key}"`)
  })
}

test("the demo user belongs to the system group and two organisations", async () => {
  const { body } = await call("platform", `api/v2/users/${DEMO_USER._id}`)
  assert.equal(body.users[0].groups.length, 3)
})

test("an organisation only sees its own devices", async () => {
  const all = await call("beacon", "api/v1/devices/synced", { limit: "100" })
  const own = await call("beacon", "api/v1/devices/synced", { limit: "100", group: partner })
  assert.equal(all.body.meta.totalDevices, DEVICES.length)
  assert.ok(own.body.meta.totalDevices < DEVICES.length)
  assert.ok(own.body.devices.every((d) => d.groups.includes(partner)))
})

test("the same request returns the same fleet", async () => {
  const first = await call("beacon", "api/v1/devices/synced", { limit: "5" })
  const second = await call("beacon", "api/v1/devices/synced", { limit: "5" })
  assert.deepEqual(first.body.devices.map((d) => d._id), second.body.devices.map((d) => d._id))
})

test("a request with no handler fails loudly, naming the endpoint", async () => {
  const { status, body } = await call("beacon", "api/v1/no/such/thing")
  assert.equal(status, 501)
  assert.match(body.message, /GET \/no\/such\/thing/)
})
