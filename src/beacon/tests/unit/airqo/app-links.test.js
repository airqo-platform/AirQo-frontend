import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { getAppLinks, inApp } from "@/lib/app-links"

// AirQo's companion apps, from beacon.config.ts. Not part of the exported template.

test("links to Vertex and Nexus follow the environment Beacon is running in", () => {
  assert.equal(getAppLinks("production").deviceManagementMyDevices, "https://vertex.airqo.net/devices/my-devices")
  assert.equal(getAppLinks("production").organisationAccessRequest, "https://nexus.airqo.net/request-organization")
  for (const environment of ["staging", "development"]) {
    assert.equal(getAppLinks(environment).deviceManagementOrgDevices, "https://staging-vertex.airqo.net/devices/overview")
    assert.equal(getAppLinks(environment).organisationAccess, "https://staging-nexus.airqo.net")
  }
})

test("prompts and analytics name the companion apps", () => {
  const links = getAppLinks("production")
  assert.equal(inApp("Add a device", links.deviceManagementName), "Add a device in Vertex")
  assert.equal(links.deviceManagementKey, "vertex")
  assert.equal(links.organisationAccessKey, "nexus")
})
