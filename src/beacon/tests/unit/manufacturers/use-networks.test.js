import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { NETWORKS_QUERY_KEY, networksQueryKey } from "@/hooks/use-networks"

test("networksQueryKey separates organisation-scoped lists from the fleet-wide one", () => {
  const fleet = networksQueryKey()
  const org = networksQueryKey({ group: "caanary_stream", onlyWithDevices: true })
  const otherOrg = networksQueryKey({ group: "kcca", onlyWithDevices: true })

  assert.deepEqual(fleet.slice(0, NETWORKS_QUERY_KEY.length), [...NETWORKS_QUERY_KEY])
  assert.deepEqual(fleet[1], { includeCounts: true, group: null, onlyWithDevices: false })
  assert.deepEqual(org[1], { includeCounts: true, group: "caanary_stream", onlyWithDevices: true })
  assert.notDeepEqual(org, otherOrg)
  assert.notDeepEqual(org, fleet)
})

test("networksQueryKey normalises blank groups and defaults", () => {
  assert.deepEqual(networksQueryKey({ group: "   " })[1], { includeCounts: true, group: null, onlyWithDevices: false })
  assert.deepEqual(networksQueryKey({ group: " airqo ", includeCounts: false })[1], {
    includeCounts: false,
    group: "airqo",
    onlyWithDevices: false,
  })
})
