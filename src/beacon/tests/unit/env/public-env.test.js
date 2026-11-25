import test, { afterEach, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import "../test-env.mjs"

import {
  PUBLIC_ENV_KEYS,
  getPublicEnv,
  getPublicEnvScript,
  getPublicEnvSnapshot,
  readServerEnv,
} from "@/lib/public-env"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")

let originalEnv
beforeEach(() => {
  originalEnv = process.env
  process.env = { ...originalEnv }
})
afterEach(() => {
  process.env = originalEnv
  delete window.__BEACON_PUBLIC_ENV__
})

test("the browser reads the copy the server wrote into the page", () => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "from-process"
  window.__BEACON_PUBLIC_ENV__ = { NEXT_PUBLIC_POSTHOG_KEY: "from-page" }
  assert.equal(getPublicEnv("NEXT_PUBLIC_POSTHOG_KEY"), "from-page")
})

test("once the page copy exists, a key missing from it stays unset", () => {
  process.env.NEXT_PUBLIC_ENV = "from-process"
  window.__BEACON_PUBLIC_ENV__ = {}
  assert.equal(getPublicEnv("NEXT_PUBLIC_ENV"), undefined)
})

test("without a page copy (the server, tests) it reads the process's environment", () => {
  process.env.NEXT_PUBLIC_ENV = "staging"
  assert.equal(getPublicEnv("NEXT_PUBLIC_ENV"), "staging")
  assert.equal(readServerEnv("NEXT_PUBLIC_ENV"), "staging")
})

test("the page copy holds only listed keys that are set", () => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_runtime"
  process.env.NEXT_PUBLIC_POSTHOG_HOST = ""
  process.env.NEXTAUTH_SECRET = "server-only"
  process.env.NEXT_PUBLIC_NOT_LISTED = "unlisted"

  const snapshot = getPublicEnvSnapshot()
  assert.equal(snapshot.NEXT_PUBLIC_POSTHOG_KEY, "phc_runtime")
  assert.equal("NEXT_PUBLIC_POSTHOG_HOST" in snapshot, false)
  assert.equal("NEXTAUTH_SECRET" in snapshot, false)
  assert.equal("NEXT_PUBLIC_NOT_LISTED" in snapshot, false)
  assert.ok(!getPublicEnvScript().includes("server-only"))
})

test("the shared keys are part of the list", () => {
  for (const key of ["NEXT_PUBLIC_ENV", "NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"]) {
    assert.ok(PUBLIC_ENV_KEYS.includes(key), key)
  }
})

test("a value can't close the script tag", () => {
  const script = getPublicEnvScript({ NEXT_PUBLIC_APP_VERSION: "</script><script>alert(1)</script>" })
  assert.ok(!script.includes("</script>"))
  assert.ok(script.startsWith("window.__BEACON_PUBLIC_ENV__="))
})

// Next.js freezes every literal process.env read of a NEXT_PUBLIC_ variable into the build, so
// one stray read brings back the need for a .env at build time. next.config.* runs at build anyway.
test("no code reads a NEXT_PUBLIC_ variable at build time", () => {
  const skipDirs = new Set(["node_modules", ".next", "tests", "public", "coverage", "brag-output"])
  const offenders = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith(".")) continue
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) {
        if (!skipDirs.has(entry)) walk(full)
        continue
      }
      if (!/\.(ts|tsx|js|jsx|mjs)$/.test(entry) || /^next\.config\./.test(entry)) continue
      if (/process\.env\.NEXT_PUBLIC_/.test(readFileSync(full, "utf8"))) offenders.push(path.relative(ROOT, full))
    }
  }
  walk(ROOT)
  assert.deepEqual(offenders, [], "read these through getPublicEnv() from lib/public-env")
})
