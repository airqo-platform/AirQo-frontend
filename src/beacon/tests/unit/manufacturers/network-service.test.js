import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import authService from "@/services/api-service"
import { NetworkApiError, networkService } from "@/services/network.service"

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

/** Replaces fetch for one test and records the calls it received. */
const withFetch = (handler) => {
  const calls = []
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url
    calls.push({ url, method: init.method ?? "GET", headers: init.headers ?? {} })
    return handler({ url, init })
  }
  return calls
}

const withToken = (token) => {
  authService.getToken = () => token
}

test("getNetworks asks for counts and unwraps the networks list", async () => {
  withToken(null)
  const networks = [{ network_id: "1", name: "airqo", enabled: true, total_devices: 3 }]
  const calls = withFetch(() => jsonResponse({ success: true, message: "ok", total: 1, networks }))

  const result = await networkService.getNetworks()

  assert.deepEqual(result, networks)
  assert.equal(calls.length, 1)
  assert.match(calls[0].url, /\/api\/v1\/networks\/\?include_counts=true$/)
  assert.equal(calls[0].method, "GET")
  assert.equal(calls[0].headers.Authorization, undefined, "listing networks needs no token")
})

test("getNetworks can skip the counts and tolerates a missing list", async () => {
  withToken(null)
  const calls = withFetch(() => jsonResponse({ success: true, message: "ok" }))
  assert.deepEqual(await networkService.getNetworks({ includeCounts: false }), [])
  assert.match(calls[0].url, /include_counts=false$/)
})

test("JWT-only actions refuse to run without a token", async () => {
  withToken(null)
  const calls = withFetch(() => jsonResponse({ success: true, message: "ok" }))
  await assert.rejects(() => networkService.syncNetworks(), (err) => err instanceof NetworkApiError && err.status === 401)
  await assert.rejects(() => networkService.syncExternalReadings(), (err) => err instanceof NetworkApiError && err.status === 401)
  await assert.rejects(() => networkService.pollExternalFeeds(), (err) => err instanceof NetworkApiError && err.status === 401)
  assert.equal(calls.length, 0, "no request is sent without a token")
})

test("syncNetworks posts with the platform token as-is", async () => {
  withToken("JWT test-token")
  const calls = withFetch(() => jsonResponse({ success: true, message: "Networks synced", updates_count: 2, new_count: 1 }))

  const result = await networkService.syncNetworks()

  assert.equal(result.message, "Networks synced")
  assert.equal(result.new_count, 1)
  assert.match(calls[0].url, /\/api\/v1\/networks\/sync$/)
  assert.equal(calls[0].method, "POST")
  assert.equal(calls[0].headers.Authorization, "JWT test-token")
})

test("syncExternalReadings sends a sane days value and pollExternalFeeds hits its endpoint", async () => {
  withToken("JWT test-token")
  const calls = withFetch(() => jsonResponse({ success: true, message: "started" }))

  await networkService.syncExternalReadings(7)
  await networkService.syncExternalReadings(0)
  await networkService.syncExternalReadings(2.9)
  await networkService.pollExternalFeeds()

  assert.match(calls[0].url, /\/data-sync\/sync-external\?days=7$/)
  assert.match(calls[1].url, /days=14$/, "a non-positive value falls back to the 14-day default")
  assert.match(calls[2].url, /days=2$/)
  assert.match(calls[3].url, /\/data-sync\/poll-external-feeds$/)
  assert.ok(calls.every((call) => call.method === "POST"))
})

test("profiles and seeding use the networks/profiles endpoints", async () => {
  withToken(null)
  const profiles = [{ name: "airgradient_lowcost", network: "airgradient", category: "lowcost", profile_id: "p1", diagnosable: true, components: ["pm_sensor"], transmission_components: [], errors: [], warnings: [] }]
  const calls = withFetch(({ url }) =>
    url.endsWith("/networks/profiles")
      ? jsonResponse({ success: true, message: "ok", profiles })
      : jsonResponse({ success: true, message: "1 profiles created", created: ["airgradient_lowcost"], existing: [], components_added: [], devices_assigned: 12, diagnosable: ["airgradient_lowcost"] })
  )

  assert.deepEqual(await networkService.getManufacturerProfiles(), profiles)
  const seeded = await networkService.seedManufacturerProfiles()
  assert.equal(seeded.devices_assigned, 12)
  assert.match(calls[0].url, /\/networks\/profiles$/)
  assert.equal(calls[0].method, "GET")
  assert.match(calls[1].url, /\/networks\/profiles\/seed$/)
  assert.equal(calls[1].method, "POST")
})

test("API errors surface the server's detail message and status", async () => {
  withToken("JWT test-token")
  withFetch(() => jsonResponse({ detail: "Error fetching data from platform" }, 400))

  await assert.rejects(
    () => networkService.syncNetworks(),
    (err) => err instanceof NetworkApiError && err.status === 400 && err.message === "Error fetching data from platform"
  )
})

test("getNetworks scopes the counts to an organisation when a group is given", async () => {
  withToken(null)
  const calls = withFetch(() => jsonResponse({ success: true, message: "ok", total: 1, scoped_to_group: true, networks: [] }))

  await networkService.getNetworks({ group: "caanary_stream", onlyWithDevices: true })
  await networkService.getNetworks({ group: "  ", onlyWithDevices: false })

  const scoped = new URL(calls[0].url)
  assert.equal(scoped.pathname.endsWith("/networks/"), true)
  assert.equal(scoped.searchParams.get("include_counts"), "true")
  assert.equal(scoped.searchParams.get("group"), "caanary_stream")
  assert.equal(scoped.searchParams.get("only_with_devices"), "true")

  const fleet = new URL(calls[1].url)
  assert.equal(fleet.searchParams.has("group"), false, "a blank group means the whole fleet")
  assert.equal(fleet.searchParams.has("only_with_devices"), false)
})

test("buildNetworksQuery encodes the listing parameters", async () => {
  const { buildNetworksQuery } = await import("@/services/network.service")
  assert.equal(buildNetworksQuery(), "include_counts=true")
  assert.equal(buildNetworksQuery({ includeCounts: false }), "include_counts=false")
  assert.equal(
    buildNetworksQuery({ group: "airqo,kcca group", onlyWithDevices: true }),
    "include_counts=true&group=airqo%2Ckcca+group&only_with_devices=true"
  )
})
