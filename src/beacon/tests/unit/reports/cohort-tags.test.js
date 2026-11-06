import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { isDefaultCohort, withoutDefaultCohort } from "@/lib/cohort-tags"

test("only the airqo cohort counts as the default, whatever its casing", () => {
  assert.equal(isDefaultCohort("airqo"), true)
  assert.equal(isDefaultCohort(" AirQo "), true)
  assert.equal(isDefaultCohort("airqo_uganda"), false)
  assert.equal(isDefaultCohort("epic_kampala"), false)
  assert.equal(isDefaultCohort(undefined), false)
})

test("the default cohort leaves a page of clusters and its count", () => {
  const response = withoutDefaultCohort({
    airqlouds: [{ name: "airqo" }, { name: "epic_kampala" }],
    meta: { total: 12, page: 1 },
  })
  assert.deepEqual(response.airqlouds, [{ name: "epic_kampala" }])
  assert.deepEqual(response.meta, { total: 11, page: 1 })
})

test("a page without the default cohort comes back untouched", () => {
  const original = { airqlouds: [{ name: "epic_kampala" }], meta: { total: 12 } }
  assert.equal(withoutDefaultCohort(original), original)
  const noTotal = withoutDefaultCohort({ airqlouds: [{ name: "airqo" }] })
  assert.deepEqual(noTotal.airqlouds, [])
  assert.equal(noTotal.meta, undefined)
})
