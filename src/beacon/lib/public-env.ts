/**
 * Browser-safe settings read when the server runs, not when the app is built.
 *
 * Next.js replaces every `NEXT_PUBLIC_*` read written as a literal property of process.env with the
 * value it sees during `next build`, in server code as well as in the browser. Reading with a
 * variable key skips that, so the server uses the container's own environment, and the root layout
 * writes a copy of the keys below into each page for the browser. The image then builds with no
 * `.env`, and changing a value only needs a restart.
 *
 * Only list values anyone who opens the page may see: they are written into every HTML response.
 * tests/unit/env fails on any literal process.env read of a NEXT_PUBLIC_ variable outside next.config.
 */
import { INTEGRATION_PUBLIC_ENV_KEYS } from "@/lib/integration/public-env-keys"

const SHARED_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_ENV",
  "NEXT_PUBLIC_API_ADAPTER",
  "NEXT_PUBLIC_BEACON_API_URL",
  "NEXT_PUBLIC_BEACON_API_PREFIX",
  "NEXT_PUBLIC_PLATFORM_API_URL",
  "NEXT_PUBLIC_LOCAL_API_URL",
  "NEXT_PUBLIC_BEACON_MOCK",
  "NEXT_PUBLIC_ENABLE_ROAD_ROUTING",
  "NEXT_PUBLIC_OSRM_BASE_URL",
  "NEXT_PUBLIC_ENABLE_SLACK_DEV_NOTIFS",
  "NEXT_PUBLIC_APP_VERSION",
  "NEXT_PUBLIC_LOCAL_AGENT_KEY",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
] as const

/** Every key the browser gets: the shared ones, plus the deployment's own (lib/integration). */
export const PUBLIC_ENV_KEYS: readonly PublicEnvKey[] = [...SHARED_PUBLIC_ENV_KEYS, ...INTEGRATION_PUBLIC_ENV_KEYS]

export type PublicEnvKey =
  | (typeof SHARED_PUBLIC_ENV_KEYS)[number]
  | (typeof INTEGRATION_PUBLIC_ENV_KEYS)[number]
export type PublicEnv = Partial<Record<PublicEnvKey, string>>

export const PUBLIC_ENV_GLOBAL = "__BEACON_PUBLIC_ENV__"
export const PUBLIC_ENV_SCRIPT_ID = "beacon-public-env"

declare global {
  interface Window {
    __BEACON_PUBLIC_ENV__?: PublicEnv
  }
}

/** A variable from the server's environment at runtime. Undefined in the browser. */
export const readServerEnv = (key: string): string | undefined => {
  if (typeof process === "undefined" || !process.env) return undefined
  return process.env[key]
}

/**
 * A browser-safe setting. In the browser it comes from the copy the root layout wrote into the
 * page; on the server (and in tests) from process.env.
 */
export const getPublicEnv = (key: PublicEnvKey): string | undefined => {
  if (typeof window !== "undefined") {
    const fromServer = window[PUBLIC_ENV_GLOBAL]
    if (fromServer) return fromServer[key]
  }
  return readServerEnv(key)
}

/** The keys above that are set on this server, for the page copy. Empty values are left out. */
export const getPublicEnvSnapshot = (): PublicEnv => {
  const snapshot: PublicEnv = {}
  for (const key of PUBLIC_ENV_KEYS) {
    const value = readServerEnv(key)
    if (value !== undefined && value !== "") snapshot[key] = value
  }
  return snapshot
}

/** Inline script for the root layout. `<` is escaped so a value can't close the script tag. */
export const getPublicEnvScript = (snapshot: PublicEnv = getPublicEnvSnapshot()): string => {
  const json = JSON.stringify(snapshot).replace(/</g, "\\u003c")
  return `window.${PUBLIC_ENV_GLOBAL}=${json};`
}
