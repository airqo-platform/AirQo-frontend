import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"
import { beaconConfig } from "@/beacon.config"
import { isDefaultCohort, withoutDefaultCohort } from "@/lib/cohort-tags"

const SYSTEM_GROUP = beaconConfig.auth.systemGroupSlug

test("only the system group's cohort counts as the default, whatever its casing", () => {
  assert.equal(isDefaultCohort(SYSTEM_GROUP), true)
  assert.equal(isDefaultCohort(` ${SYSTEM_GROUP.toUpperCase()} `), true)
  assert.equal(isDefaultCohort(`${SYSTEM_GROUP}_uganda`), false)
  assert.equal(isDefaultCohort("epic_kampala"), false)
  assert.equal(isDefaultCohort(undefined), false)
})

test("the default cohort leaves a page of clusters and its count", () => {
  const response = withoutDefaultCohort({
    airqlouds: [{ name: SYSTEM_GROUP }, { name: "epic_kampala" }],
    meta: { total: 12, page: 1 },
  })
  assert.deepEqual(response.airqlouds, [{ name: "epic_kampala" }])
  assert.deepEqual(response.meta, { total: 11, page: 1 })
})

test("a page without the default cohort comes back untouched", () => {
  const original = { airqlouds: [{ name: "epic_kampala" }], meta: { total: 12 } }
  assert.equal(withoutDefaultCohort(original), original)
  const noTotal = withoutDefaultCohort({ airqlouds: [{ name: SYSTEM_GROUP }] })
  assert.deepEqual(noTotal.airqlouds, [])
  assert.equal(noTotal.meta, undefined)
})
