import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { isDefaultCohort, withoutDefaultCohort } from "@/lib/cohort-tags"

test("only the system cohort counts as the default, whatever its casing", () => {
  assert.equal(isDefaultCohort("system"), true)
  assert.equal(isDefaultCohort(" System "), true)
  assert.equal(isDefaultCohort("system_pilot"), false)
  assert.equal(isDefaultCohort("riverside_city_network"), false)
  assert.equal(isDefaultCohort(undefined), false)
})

test("the default cohort leaves a page of clusters and its count", () => {
  const response = withoutDefaultCohort({
    airqlouds: [{ name: "system" }, { name: "riverside_city_network" }],
    meta: { total: 12, page: 1 },
  })
  assert.deepEqual(response.airqlouds, [{ name: "riverside_city_network" }])
  assert.deepEqual(response.meta, { total: 11, page: 1 })
})

test("a page without the default cohort comes back untouched", () => {
  const original = { airqlouds: [{ name: "riverside_city_network" }], meta: { total: 12 } }
  assert.equal(withoutDefaultCohort(original), original)
  const noTotal = withoutDefaultCohort({ airqlouds: [{ name: "system" }] })
  assert.deepEqual(noTotal.airqlouds, [])
  assert.equal(noTotal.meta, undefined)
})
