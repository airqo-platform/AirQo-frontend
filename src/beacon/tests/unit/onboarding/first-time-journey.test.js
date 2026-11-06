import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { getHomeFeatures } from "@/components/home/home-features"
import { getDeviceNavSections } from "@/components/dashboard/nav-config"
import { getAppLinks } from "@/lib/app-links"
import { countDevices, isDeviceOnline, percentageOf } from "@/lib/device-status"
import { ROUTES, getNavigationAccess, getPageTitle, isRouteAccessible } from "@/lib/navigation"
import { mergeOrganisationOptions, normalizeDiscoveredOrganisations } from "@/lib/organisations"
import { getTourCardPosition, getTourForPath, hasSeenTour, markTourSeen } from "@/lib/tours"

const accessFor = (activeGroup, { admin = false, permissions = [] } = {}) =>
  getNavigationAccess({
    activeGroup,
    isActiveGroupAdmin: admin,
    hasPermission: (permission) => permissions.includes(permission),
    hasAnyPermission: (wanted) => wanted.some((permission) => permissions.includes(permission)),
  })

const NEW_USER = accessFor("airqo")
const AIRQO_ADMIN = accessFor("airqo", { admin: true })
const ORG_MEMBER = accessFor("city_network")
const NO_GROUP = accessFor(null)

test("links to Vertex and Nexus follow the environment Beacon is running in", () => {
  assert.equal(getAppLinks("production").vertexMyDevices, "https://vertex.airqo.net/devices/my-devices")
  assert.equal(getAppLinks("production").nexusRequestOrganisation, "https://nexus.airqo.net/request-organization")
  for (const environment of ["staging", "development"]) {
    assert.equal(getAppLinks(environment).vertexOrgDevices, "https://staging-vertex.airqo.net/devices/overview")
    assert.equal(getAppLinks(environment).nexus, "https://staging-nexus.airqo.net")
  }
})

test("Home is open to everyone signed in and named in the top bar", () => {
  for (const access of [NEW_USER, AIRQO_ADMIN, ORG_MEMBER, NO_GROUP]) {
    assert.equal(isRouteAccessible(ROUTES.HOME, access), true)
  }
  assert.equal(getPageTitle(ROUTES.HOME), "Home")
})

test("the side menu leads with Home in every devices context", () => {
  for (const access of [NEW_USER, AIRQO_ADMIN, ORG_MEMBER]) {
    assert.equal(getDeviceNavSections(access)[0].items[0].href, ROUTES.HOME)
  }
})

test("Home keeps showing a new user what an organisation would unlock", () => {
  const features = getHomeFeatures(NEW_USER)
  assert.deepEqual(
    features.map((feature) => [feature.id, feature.available]),
    [
      ["my-devices", true],
      ["sites", false],
      ["analytics", false],
      ["network-health", false],
      ["maintenance", false],
      ["reports", false],
    ]
  )
})

test("Home has nothing locked for an organisation member", () => {
  const features = getHomeFeatures(ORG_MEMBER)
  assert.ok(features.every((feature) => feature.available))
  assert.ok(!features.some((feature) => feature.id === "my-devices"))
})

test("Home doesn't tell AirQo staff they need an organisation", () => {
  const features = getHomeFeatures(AIRQO_ADMIN)
  assert.ok(features.every((feature) => feature.available))
  assert.ok(!features.some((feature) => feature.id === "network-health"))
})

test("every listed Home feature that's available can actually be opened", () => {
  for (const access of [NEW_USER, AIRQO_ADMIN, ORG_MEMBER, NO_GROUP]) {
    for (const feature of getHomeFeatures(access)) {
      if (feature.available) assert.equal(isRouteAccessible(feature.href, access), true, feature.id)
    }
  }
})

test("device counts treat a device as online from the start of the previous day", () => {
  const now = new Date("2026-11-05T12:00:00")
  const seen = (timestamp, status = "deployed") => ({ reading_timestamp: timestamp, status })

  assert.equal(isDeviceOnline(seen("2026-11-04T00:30:00"), now), true)
  assert.equal(isDeviceOnline(seen("2026-11-03T23:30:00"), now), false)
  assert.equal(isDeviceOnline(seen("not a date"), now), false)
  assert.equal(isDeviceOnline({}, now), false)

  assert.deepEqual(
    countDevices([seen("2026-11-05T10:00:00"), seen("2026-11-01T10:00:00", "not deployed")], now),
    { total: 2, tracked: 2, deployed: 1, online: 1, offline: 1 }
  )
  assert.deepEqual(countDevices([], now), { total: 0, tracked: 0, deployed: 0, online: 0, offline: 0 })
})

test("percentages don't divide by zero", () => {
  assert.equal(percentageOf(1, 4), 25)
  assert.equal(percentageOf(0, 0), 0)
})

test("the switcher lists member organisations first and doesn't repeat them", () => {
  const memberships = [
    { _id: "1", grp_title: "airqo", organization_slug: "airqo", role: { _id: "r", role_name: "AIRQO_DEFAULT_USER" } },
    { _id: "2", grp_title: "city_network", organization_slug: "city-network" },
  ]
  const discovered = [
    { _id: "1", grp_title: "airqo", organization_slug: "airqo" },
    { _id: "3", grp_title: "CITY_NETWORK" },
    { _id: "4", grp_title: "renamed", organization_slug: "city-network" },
    { _id: "5", grp_title: "lakeside_university", organization_slug: "lakeside" },
  ]

  assert.deepEqual(mergeOrganisationOptions(memberships, discovered), [
    { id: "1", title: "airqo", isMember: true, roleName: "airqo default user" },
    { id: "2", title: "city_network", isMember: true, roleName: undefined },
    { id: "5", title: "lakeside_university", isMember: false },
  ])
})

test("the switcher still lists memberships before, or without, the discovery response", () => {
  const memberships = [{ _id: "1", grp_title: "airqo" }]
  assert.equal(mergeOrganisationOptions(memberships).length, 1)
})

test("unusable discovery responses leave the list short rather than throwing", () => {
  assert.deepEqual(normalizeDiscoveredOrganisations(null), [])
  assert.deepEqual(normalizeDiscoveredOrganisations({ success: false }), [])
  assert.deepEqual(
    normalizeDiscoveredOrganisations({ groups: [null, { _id: "1" }, { grp_title: "no id" }, { _id: "2", grp_title: "kept" }] }),
    [{ _id: "2", grp_title: "kept", organization_slug: undefined }]
  )
})

test("tours exist for every planned page and only where the person may go", () => {
  const idFor = (pathname, access) => getTourForPath(pathname, access)?.id ?? null

  assert.equal(idFor(ROUTES.HOME, NEW_USER), "home")
  assert.equal(idFor(ROUTES.MY_DEVICES, NEW_USER), "device-list")
  assert.equal(idFor(ROUTES.DEVICES, ORG_MEMBER), "device-list")
  assert.equal(idFor("/dashboard/devices/airqo_g5363", NEW_USER), "device-details")
  assert.equal(idFor(ROUTES.NETWORK_HEALTH, ORG_MEMBER), "network-health")
  assert.equal(idFor(ROUTES.MAINTENANCE, ORG_MEMBER), "maintenance")
  assert.equal(idFor(ROUTES.SITES, ORG_MEMBER), "sites")
  assert.equal(idFor(ROUTES.ANALYTICS, ORG_MEMBER), "clustered-analysis")
  assert.equal(idFor(ROUTES.REPORTS, ORG_MEMBER), "reports")
  assert.equal(idFor(ROUTES.DIAGNOSTICS, AIRQO_ADMIN), "fleet-health")

  assert.equal(idFor(ROUTES.NETWORK_HEALTH, NEW_USER), null)
  assert.equal(idFor(ROUTES.MAINTENANCE, NEW_USER), null)
  assert.equal(idFor(ROUTES.SITES, NEW_USER), null)
  assert.equal(idFor(ROUTES.ANALYTICS, NEW_USER), null)
  assert.equal(idFor(ROUTES.REPORTS, NEW_USER), null)
  assert.equal(idFor(ROUTES.MY_DEVICES, ORG_MEMBER), null)
  assert.equal(idFor(ROUTES.DIAGNOSTICS, ORG_MEMBER), null)

  // Pages inside these sections have their own content, so they don't inherit a tour
  assert.equal(idFor("/dashboard/devices/airqo_g5363/diagnostics", ORG_MEMBER), null)
  assert.equal(idFor(`${ROUTES.SITES}/site-1`, ORG_MEMBER), null)
  assert.equal(idFor(`${ROUTES.ANALYTICS}/analysis`, ORG_MEMBER), null)
  assert.equal(idFor(`${ROUTES.DIAGNOSTICS}/issues`, AIRQO_ADMIN), null)
})

test("a tour is remembered per person", () => {
  assert.equal(hasSeenTour("person-a", "home"), false)
  markTourSeen("person-a", "home")
  assert.equal(hasSeenTour("person-a", "home"), true)
  assert.equal(hasSeenTour("person-a", "maintenance"), false)
  assert.equal(hasSeenTour("person-b", "home"), false)
})

test("the tour card stays on screen wherever its target is", () => {
  const card = { width: 384, height: 200 }
  const viewport = { width: 1280, height: 800 }
  const box = (top, left, bottom, right) => ({ top, left, bottom, right })

  // Below a target in the top bar, pulled in from the right edge
  assert.deepEqual(getTourCardPosition(box(15, 1000, 53, 1130), card, viewport), { top: 67, left: 880 })
  // Above a target at the bottom of the page
  assert.deepEqual(getTourCardPosition(box(700, 100, 760, 400), card, viewport), { top: 486, left: 100 })
  // Beside something as tall as the screen, like the side menu
  assert.deepEqual(getTourCardPosition(box(70, 6, 794, 262), card, viewport), { top: 70, left: 276 })
  // Over something that fills the screen, like the map
  assert.deepEqual(getTourCardPosition(box(0, 0, 800, 1280), card, viewport), { top: 584, left: 448 })
  // No target at all
  assert.deepEqual(getTourCardPosition(null, card, viewport), { top: 584, left: 448 })
  // A phone narrower than the card keeps the gutter
  assert.deepEqual(getTourCardPosition(box(15, 200, 53, 320), { width: 288, height: 200 }, { width: 320, height: 640 }), {
    top: 67,
    left: 16,
  })
})
