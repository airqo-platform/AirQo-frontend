import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NextRequest } from "next/server"
import middleware from "@/middleware"
import AuthErrorPage from "@/app/auth-error/page"
import { AUTH_ERRORS, getAuthError } from "@/lib/auth-errors"

process.env.NEXTAUTH_SECRET = "test-secret"

const redirectFor = async (path) => {
  const response = await middleware(new NextRequest(`http://localhost:3000${path}`), {})
  const location = response?.headers.get("location")
  return location ? new URL(location) : null
}

const render = (searchParams) => renderToStaticMarkup(createElement(AuthErrorPage, { searchParams }))

test("a signed-out visitor reaches /auth-error instead of being sent to login", async () => {
  for (const path of ["/auth-error", "/auth-error?error=AccessDenied", "/auth-error/"]) {
    assert.equal(await redirectFor(path), null, path)
  }
})

test("only /auth-error itself is opened up, not paths that start the same way", async () => {
  assert.equal((await redirectFor("/auth-errors"))?.pathname, "/login")
})

test("without a secret, pages go to /auth-error?error=Configuration and the page itself still opens", async (t) => {
  const secret = process.env.NEXTAUTH_SECRET
  const logError = console.error
  delete process.env.NEXTAUTH_SECRET
  console.error = () => {}
  t.after(() => {
    process.env.NEXTAUTH_SECRET = secret
    console.error = logError
  })

  const location = await redirectFor("/dashboard/home")
  assert.equal(location.pathname, "/auth-error")
  assert.equal(location.searchParams.get("error"), "Configuration")
  assert.equal(await redirectFor("/auth-error?error=Configuration"), null)
})

test("each next-auth code gets its own plain-language copy", () => {
  for (const code of ["OAuthSignin", "OAuthCallback", "AccessDenied", "Configuration", "CredentialsSignin", "Verification"]) {
    const error = getAuthError(code)
    assert.equal(error.code, code)
    assert.equal(error.title, AUTH_ERRORS[code].title)
    assert.notEqual(error.title, AUTH_ERRORS.Default.title, code)
  }
})

test("a missing, repeated or unknown code falls back to the general copy", () => {
  assert.equal(getAuthError(undefined).code, "Default")
  assert.equal(getAuthError("").code, "Default")
  assert.equal(getAuthError("toString").code, "Default")
  assert.equal(getAuthError("Authentication failed").code, "Default")
  assert.equal(getAuthError(["AccessDenied", "Configuration"]).code, "AccessDenied")
})

test("the page explains the error and links back to sign in", () => {
  const html = render({ error: "AccessDenied" })

  assert.match(html, /You don&#x27;t have access to Beacon/)
  assert.match(html, /role="alert"/)
  assert.match(html, /Error code: <span class="font-mono">AccessDenied<\/span>/)
  assert.match(html, /href="\/login"/)
  assert.match(html, /Back to sign in/)
})

test("text from the link is never echoed onto the page", () => {
  const html = render({ error: "Call 0800 000 000 to restore your account" })

  assert.match(html, /Something went wrong signing you in/)
  assert.doesNotMatch(html, /0800/)
  assert.doesNotMatch(html, /Error code/)
})
