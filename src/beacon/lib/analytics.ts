/**
 * Product analytics for Beacon, sent to PostHog.
 *
 * - Nothing is sent unless NEXT_PUBLIC_POSTHOG_KEY is set when the app is built.
 * - posthog-js is imported lazily once the page is idle, so it never lands in a route chunk.
 *   Calls made before it loads wait in a short queue.
 * - Only pageviews and the named events below are captured: autocapture, rage clicks and dead
 *   clicks are off. Session replay follows the PostHog project setting, with every input masked.
 * - Who did something comes from identify(); event properties carry no personal details, and
 *   URLs lose their query string and hash before they leave the browser.
 *
 * Event names are `object_action` in snake_case, past tense, for completed actions.
 * docs/POSTHOG_ANALYTICS.md lists every event and what it answers.
 */
import type { CaptureResult, PostHog, PostHogConfig } from "posthog-js"
import { getPageTitle } from "@/lib/navigation"
import config from "@/lib/config"

export const ANALYTICS_APP_NAME = "beacon"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ""
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

// ─── Route templates ───────────────────────────────────────────────────────

/**
 * Every page in app/, so `/dashboard/devices/aq_g5_87` is reported as `/dashboard/devices/[id]`
 * and usage of a page adds up across devices. tests/unit/analytics checks this list against app/.
 */
export const ROUTE_TEMPLATES = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/dashboard/alerts",
  "/dashboard/analytics",
  "/dashboard/analytics/[id]",
  "/dashboard/analytics/analysis",
  "/dashboard/category",
  "/dashboard/category/[categoryId]",
  "/dashboard/collocation/inlab",
  "/dashboard/collocation/inlab/[id]",
  "/dashboard/collocation/site",
  "/dashboard/collocation/site/[id]",
  "/dashboard/devices",
  "/dashboard/devices/[id]",
  "/dashboard/devices/[id]/diagnostics",
  "/dashboard/devices/my-devices",
  "/dashboard/diagnostics",
  "/dashboard/diagnostics/issues",
  "/dashboard/diagnostics/simulator",
  "/dashboard/firmware",
  "/dashboard/home",
  "/dashboard/maintenance",
  "/dashboard/manufacturers",
  "/dashboard/network-health",
  "/dashboard/network-health/issues",
  "/dashboard/reports",
  "/dashboard/settings",
  "/dashboard/settings/device-profiles",
  "/dashboard/settings/device-profiles/[id]",
  "/dashboard/settings/diagnostic-templates",
  "/dashboard/settings/status-codes",
  "/dashboard/sites",
  "/dashboard/sites/[id]",
  "/dashboard/stock",
  "/dashboard/users",
  "/dashboard/visualise",
  "/dashboard/visualize",
] as const

const UNMATCHED_ROUTE = "unmatched"

const splitPath = (path: string) => path.split("/").filter(Boolean)

const TEMPLATE_SEGMENTS = ROUTE_TEMPLATES.map((template) => ({
  template,
  segments: splitPath(template),
  staticCount: splitPath(template).filter((segment) => !segment.startsWith("[")).length,
}))

/** The app/ route a pathname belongs to; a static route wins over a dynamic one at the same depth. */
export function getRouteTemplate(pathname: string | null | undefined): string {
  if (!pathname) return UNMATCHED_ROUTE
  const segments = splitPath(pathname.split(/[?#]/)[0])

  let best: (typeof TEMPLATE_SEGMENTS)[number] | null = null
  for (const candidate of TEMPLATE_SEGMENTS) {
    if (candidate.segments.length !== segments.length) continue
    const matches = candidate.segments.every(
      (segment, index) => segment.startsWith("[") || segment === segments[index]
    )
    if (matches && (!best || candidate.staticCount > best.staticCount)) best = candidate
  }
  return best?.template ?? UNMATCHED_ROUTE
}

// ─── Property hygiene ──────────────────────────────────────────────────────

const BLOCKED_KEY =
  /(?:^|_)(?:e?mail|phone|password|passcode|token|secret|authorization|api_key|cookie|name|first_name|last_name|full_name|user_name|username|message|description|comment|query)(?:_|$)/
const MAX_STRING_LENGTH = 200
const MAX_ARRAY_LENGTH = 50
const MAX_DEPTH = 3

// Flags and counts describe a value without carrying it: `has_query`, `query_length`.
const DERIVED_KEY = /^(?:has|is)_|_(?:count|length)$/

const toSnakeCase = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()

/** Whether a property key could hold personal details or free text, which events must not carry. */
export const isBlockedPropertyKey = (key: string) => {
  const snakeKey = toSnakeCase(key)
  return !DERIVED_KEY.test(snakeKey) && BLOCKED_KEY.test(snakeKey)
}

const sanitizeValue = (value: unknown, depth: number): unknown => {
  if (value === null || typeof value === "boolean") return value
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") return value.slice(0, MAX_STRING_LENGTH)
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitizeValue(item, depth + 1))
      .filter((item) => item !== undefined)
  }
  if (typeof value === "object" && depth < MAX_DEPTH) {
    return sanitizeProperties(value as Record<string, unknown>, depth + 1)
  }
  return undefined
}

/**
 * Drops keys that could carry personal details or typed text, and anything that isn't plain data.
 * Strings are cut to 200 characters and arrays to 50 items.
 */
export function sanitizeProperties(
  properties: Record<string, unknown> | undefined,
  depth = 0
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  if (!properties) return sanitized
  for (const [key, value] of Object.entries(properties)) {
    if (isBlockedPropertyKey(key)) continue
    const clean = sanitizeValue(value, depth)
    if (clean !== undefined) sanitized[key] = clean
  }
  return sanitized
}

/** A URL without its query string or hash, which can hold tokens and search text. */
export function stripUrlDetails(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return url.split(/[?#]/)[0]
  }
}

const URL_PROPERTY = /(?:url|referrer)$/i

const stripUrlProperties = (properties: Record<string, unknown> | undefined) => {
  if (!properties) return
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string" && URL_PROPERTY.test(key)) properties[key] = stripUrlDetails(value)
  }
}

/** Last step before an event leaves the browser: no query strings or hashes in any URL. */
export function beforeSend(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event
  stripUrlProperties(event.properties)
  stripUrlProperties(event.$set)
  stripUrlProperties(event.$set_once)
  return event
}

/**
 * Properties every event carries, PostHog's own ($pageleave, $identify, …) included. Added here
 * rather than with register() because posthog.reset() on sign-out clears registered properties.
 */
export function withAppProperties(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event
  event.properties = {
    app_name: ANALYTICS_APP_NAME,
    environment: config.environment,
    ...event.properties,
  }
  return event
}

/** Where one of our events happened, in a form that adds up across ids. */
export function getPageContext(pathname: string) {
  return {
    route: getRouteTemplate(pathname),
    page_title: getPageTitle(pathname),
  }
}

// ─── Client ────────────────────────────────────────────────────────────────

type Task = (client: PostHog) => void

const MAX_QUEUED_TASKS = 100
const MAX_LOAD_ATTEMPTS = 3
const CREDENTIAL_RETRY_MS = 1000
const MAX_CREDENTIAL_RETRIES = 60

let client: PostHog | null = null
let loading: Promise<PostHog | null> | null = null
let queue: Task[] = []
let credentialRetries = 0
let credentialTimer: ReturnType<typeof setTimeout> | null = null
let initScheduled = false
let failedLoads = 0

export const isAnalyticsEnabled = () =>
  Boolean(POSTHOG_KEY) && typeof window !== "undefined" && failedLoads < MAX_LOAD_ATTEMPTS

// Sign-in hand-offs and reset links carry a token in the URL. PostHog starts once the app has
// consumed it, so neither an event nor a replay can pick it up.
const urlCarriesCredentials = () =>
  /(?:^|[#?&])[^=&#]*token[^=&#]*=/i.test(`${window.location.search}${window.location.hash}`)

const posthogConfig = (): Partial<PostHogConfig> => ({
  api_host: POSTHOG_HOST,
  autocapture: false,
  rageclick: false,
  capture_dead_clicks: false,
  capture_pageview: false,
  capture_pageleave: true,
  persistence: "localStorage+cookie",
  person_profiles: "identified_only",
  // Replay is switched on and off in the PostHog project settings.
  disable_session_recording: false,
  session_recording: { maskAllInputs: true },
  internal_or_test_user_hostname: /^(localhost|127\.0\.0\.1|.+\.localhost)$/,
  before_send: [withAppProperties, beforeSend],
})

function flushQueue(posthog: PostHog) {
  const pending = queue
  queue = []
  for (const task of pending) {
    try {
      task(posthog)
    } catch (error) {
      console.warn("Analytics call failed:", error)
    }
  }
}

/** Loads and starts PostHog once. Safe to call repeatedly; does nothing without a key. */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || loading || credentialTimer) return

  if (urlCarriesCredentials()) {
    if (credentialRetries++ < MAX_CREDENTIAL_RETRIES) {
      credentialTimer = setTimeout(() => {
        credentialTimer = null
        initAnalytics()
      }, CREDENTIAL_RETRY_MS)
    } else {
      // Stop polling; the next tracked call (such as the next page) tries again
      credentialRetries = 0
      initScheduled = false
    }
    return
  }

  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, posthogConfig())
      client = posthog
      flushQueue(posthog)
      return posthog
    })
    .catch((error) => {
      // Offline or blocked. Keep what was waiting, the user's identify included, and let the next
      // call try again; after a few failures, drop it and carry on without analytics.
      console.warn("Analytics failed to load:", error)
      loading = null
      initScheduled = false
      if (++failedLoads >= MAX_LOAD_ATTEMPTS) queue = []
      return null
    })
}

// The first call starts the load once the browser is idle, after the page's own requests.
function scheduleInit() {
  if (initScheduled) return
  initScheduled = true
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => initAnalytics(), { timeout: 3000 })
  } else {
    setTimeout(initAnalytics, 1000)
  }
}

/**
 * Runs `task` now, or queues it until PostHog loads. Events are capped at MAX_QUEUED_TASKS;
 * identity calls (`essential`) are always kept, since the provider won't repeat them.
 */
function withClient(task: Task, { essential = false } = {}) {
  if (!isAnalyticsEnabled()) return
  if (client) {
    try {
      task(client)
    } catch (error) {
      console.warn("Analytics call failed:", error)
    }
    return
  }
  if (essential || queue.length < MAX_QUEUED_TASKS) queue.push(task)
  scheduleInit()
}

export interface TrackOptions {
  /** Send straight away by beacon, for an action that ends in a full page load or sign-out. */
  sendNow?: boolean
}

/** Records a completed action. Properties pass through sanitizeProperties(). */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
  options: TrackOptions = {}
): void {
  if (!isAnalyticsEnabled()) return
  // Read the page now, not when a queued call finally runs.
  const page = getPageContext(window.location.pathname)
  withClient((posthog) =>
    posthog.capture(
      event,
      { ...sanitizeProperties(properties), ...page },
      options.sendNow ? { transport: "sendBeacon" } : undefined
    )
  )
}

/** Records a page view under its route template; query strings and hashes are left out. */
export function trackPageview(pathname: string): void {
  if (!isAnalyticsEnabled()) return
  const page = getPageContext(pathname)
  const url = `${window.location.origin}${pathname}`
  withClient((posthog) => posthog.capture("$pageview", { $current_url: url, ...page }))
}

export interface AnalyticsPerson {
  id: string
  role?: string
}

/** Ties this browser's events to a signed-in user. Only the stable id and role are sent. */
export function identifyUser({ id, role }: AnalyticsPerson): void {
  withClient((posthog) => {
    const personProperties = sanitizeProperties({ beacon_role: role })
    if (posthog.get_distinct_id() === id) {
      if (role) posthog.setPersonProperties(personProperties)
      return
    }
    // Someone else was signed in on this browser: start fresh so their history isn't joined to this
    // person. (A sign-out reloads the page, so this is how a second account is noticed.)
    if (posthog.get_property("$user_state") === "identified") posthog.reset()
    posthog.identify(id, personProperties)
  }, { essential: true })
}

export interface AnalyticsOrganization {
  id: string
  title?: string
  slug?: string
}

/**
 * Associates events with the active group. Uses PostHog's `organization` group type, the same
 * one Nexus uses, so one organisation's activity can be followed across AirQo apps.
 */
export function setActiveOrganization(organization: AnalyticsOrganization | null): void {
  withClient((posthog) => {
    if (!organization) {
      posthog.resetGroups()
      return
    }
    // Group properties don't pass through sanitizeProperties(): it would drop `name` (see BLOCKED_KEY)
    posthog.group("organization", organization.id, {
      name: organization.title,
      ...(organization.slug ? { slug: organization.slug } : {}),
    })
  }, { essential: true })
}

/** Forgets the signed-in user on sign-out, so the next person on this browser starts fresh. */
export function resetAnalytics(): void {
  withClient((posthog) => posthog.reset(), { essential: true })
}
