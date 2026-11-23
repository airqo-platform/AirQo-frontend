import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { NextRequest } from "next/server"
import middleware from "@/middleware"
import { consumeOAuthTokenHandoffFromUrl, resolveOAuthRedirectAfterUrl } from "@/lib/oauth-session"

process.env.NEXTAUTH_SECRET = "test-secret"

// Social sign-in through the AirQo platform. Not part of the exported template.

const redirectFor = async (path) => {
  const response = await middleware(new NextRequest(`http://localhost:3000${path}`), {})
  const location = response?.headers.get("location")
  return location ? new URL(location) : null
}

test("an OAuth callback still reaches the page so the client can read the token", async () => {
  assert.equal(await redirectFor("/dashboard/sites/s1?group=kcca&success=google"), null)
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
