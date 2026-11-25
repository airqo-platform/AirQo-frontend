import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { PUBLIC_ENV_KEYS, getPublicEnvSnapshot } from "@/lib/public-env"

// The platform API URLs come from lib/integration/public-env-keys.ts, so the browser gets them at
// runtime along with the shared settings.
test("the platform API URLs reach the browser's copy of the settings", () => {
  const original = process.env
  process.env = {
    ...original,
    NEXT_PUBLIC_AIRQO_API_BASE_URL: "https://beacon.airqo.net",
    NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL: "https://staging-beacon.airqo.net",
  }
  try {
    assert.ok(PUBLIC_ENV_KEYS.includes("NEXT_PUBLIC_AIRQO_API_BASE_URL"))
    assert.ok(PUBLIC_ENV_KEYS.includes("NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL"))
    assert.equal(getPublicEnvSnapshot().NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL, "https://staging-beacon.airqo.net")
  } finally {
    process.env = original
  }
})
