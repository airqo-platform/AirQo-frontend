import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { NextRequest } from "next/server"
import middleware from "@/middleware"
import { findGroupTitle, getGroupLink } from "@/lib/group-context"
import { getSafeReturnPath } from "@/lib/navigation"
import { consumeOAuthTokenHandoffFromUrl, resolveOAuthRedirectAfterUrl } from "@/lib/oauth-session"

process.env.NEXTAUTH_SECRET = "test-secret"

const GROUPS = [
  { _id: "1", grp_title: "airqo" },
  { _id: "2", grp_title: "kcca" },
  { _id: "3", grp_title: "My Org" },
]

// The pages Vertex's Open in Beacon links open
const LINKS = [
  "/dashboard/devices/d1/diagnostics?group=airqo",
  "/dashboard/analytics/c1?group=kcca",
  "/dashboard/sites/s1?group=my%20org",
]

const redirectFor = async (path) => {
  const response = await middleware(new NextRequest(`http://localhost:3000${path}`), {})
  const location = response?.headers.get("location")
  return location ? new URL(location) : null
}

test("a ?group= link picks a group the user belongs to", () => {
  assert.equal(findGroupTitle(GROUPS, getGroupLink("?group=kcca")), "kcca")
  assert.equal(findGroupTitle(GROUPS, getGroupLink("?group=My%20Org")), "My Org")
})

test("a ?group= link resolves to the user's own spelling, which everything else compares against", () => {
  assert.equal(findGroupTitle([{ _id: "1", grp_title: "AirQo" }], getGroupLink("?group=airqo")), "AirQo")
})

test("a ?group= link to a group the user isn't in is ignored", () => {
  assert.equal(findGroupTitle(GROUPS, getGroupLink("?group=other_org")), null)
  assert.equal(findGroupTitle([], getGroupLink("?group=kcca")), null)
})

test("no usable ?group= leaves nothing to apply", () => {
  for (const search of ["", "?type=site", "?group=", "?group=%20"]) {
    assert.equal(getGroupLink(search), null, search)
  }
  assert.equal(findGroupTitle(GROUPS, null), null)
})

test("a signed-out user keeps the path and query through /login", async () => {
  for (const link of LINKS) {
    const location = await redirectFor(link)
    assert.equal(location.pathname, "/login")
    assert.equal(location.searchParams.get("from"), link)
    assert.equal(getSafeReturnPath(location.searchParams.get("from")), link)
  }
})

test("a signed-out user without a query keeps just the path", async () => {
  const location = await redirectFor("/dashboard/devices")
  assert.equal(location.searchParams.get("from"), "/dashboard/devices")
})

test("an OAuth callback still reaches the page so the client can read the token", async () => {
  assert.equal(await redirectFor("/dashboard/sites/s1?group=kcca&success=google"), null)
})

test("only dashboard paths on this site are returned to", () => {
  for (const link of LINKS) assert.equal(getSafeReturnPath(link), link)
  assert.equal(getSafeReturnPath("/dashboard"), "/dashboard")

  for (const path of [
    null,
    undefined,
    "",
    "/",
    "dashboard/home",
    "https://evil.example/dashboard",
    "//evil.example/dashboard",
    "/\\evil.example/dashboard",
    "/\t/evil.example/dashboard",
    "/dashboardish",
    "/dashboard/../login",
    "/login?action=logout",
    "/api/auth/signout",
  ]) {
    assert.equal(getSafeReturnPath(path), null, String(path))
  }
})

test("social sign-in sends the full link out and returns to it without the OAuth params", (t) => {
  const { location } = globalThis.window
  const original = { ...location }
  globalThis.window.history = { replaceState: () => {} }
  t.after(() => {
    Object.assign(location, original)
    delete globalThis.window.history
  })

  assert.equal(resolveOAuthRedirectAfterUrl("/dashboard/sites/s1?group=kcca"), "http://localhost:3000/dashboard/sites/s1?group=kcca")

  const landOn = (pathname, search) => {
    Object.assign(location, { hash: "#token=abc", pathname, search })
    return consumeOAuthTokenHandoffFromUrl().callbackUrl
  }

  assert.equal(landOn("/dashboard/sites/s1", "?group=kcca&success=google"), "/dashboard/sites/s1?group=kcca")
  assert.equal(landOn("/dashboard/home", "?success=google"), "/dashboard/home")
  // Nothing to go back to: AuthEffect falls back to Home
  assert.equal(landOn("/login", "?success=google"), null)
  assert.equal(landOn("/dashboard/home", "?success=google&callbackUrl=/dashboard/reports"), "/dashboard/reports")
})
