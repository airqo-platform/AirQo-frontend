/**
 * Product analytics for Vertex, sent to PostHog.
 *
 * - Nothing is sent unless NEXT_PUBLIC_POSTHOG_KEY is set when the app is built.
 * - posthog-js is imported lazily once the page is idle, so it never lands in a route chunk
 *   (the size-limit budget counts route chunks). Calls made before it loads wait in a short queue.
 * - Only pageviews and the named events below are captured: autocapture, rage clicks and dead
 *   clicks are off. Session replay follows the PostHog project setting, with every input masked.
 * - Who did something comes from identify(); event properties carry no personal details, and
 *   URLs lose their query string and hash before they leave the browser.
 *
 * Event names are `object_action` in snake_case, past tense, for completed actions.
 * docs/POSTHOG_ANALYTICS.md lists every event and what it answers.
 *
 * Only the root layout's AnalyticsProvider imports this file. Everything else imports
 * lib/track.ts, which this file plugs into as it loads (see the note there).
 */
import type { CaptureResult, PostHog, PostHogConfig } from 'posthog-js';
import { getEnvironment } from '@/lib/envConstants';
import { getIsElectron } from '@/core/utils/platform';
import { connectAnalytics, type TrackOptions } from '@/lib/track';

export const ANALYTICS_APP_NAME = 'vertex';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

// ─── Route templates ───────────────────────────────────────────────────────

/**
 * Every page in app/, so `/devices/overview/64f0…` is reported as `/devices/overview/[id]` and
 * usage of a page adds up across devices. lib/analytics.test.ts checks this list against app/.
 */
export const ROUTE_TEMPLATES = [
  '/',
  '/admin/cohorts',
  '/admin/cohorts/[id]',
  '/admin/cohorts/[id]/devices/[deviceId]',
  '/admin/grids',
  '/admin/grids/[id]',
  '/admin/networks',
  '/admin/networks/[id]',
  '/admin/networks/[id]/devices/[deviceId]',
  '/admin/networks/requests',
  '/admin/shipping',
  '/admin/shipping/[batchId]',
  '/admin/sites',
  '/admin/sites/[id]',
  '/admin/sites/[id]/devices/[deviceId]',
  '/auth-error',
  '/cohorts',
  '/cohorts/[id]',
  '/devices/my-devices',
  '/devices/overview',
  '/devices/overview/[id]',
  '/download',
  '/home',
  '/login',
  '/sites/[id]',
  '/sites/my-sites',
  '/sites/overview',
] as const;

const UNMATCHED_ROUTE = 'unmatched';

const splitPath = (path: string) => path.split('/').filter(Boolean);

const TEMPLATE_SEGMENTS = ROUTE_TEMPLATES.map(template => ({
  template,
  segments: splitPath(template),
  staticCount: splitPath(template).filter(segment => !segment.startsWith('[')).length,
}));

/** The app/ route a pathname belongs to; a static route wins over a dynamic one at the same depth. */
export function getRouteTemplate(pathname: string | null | undefined): string {
  if (!pathname) return UNMATCHED_ROUTE;
  const segments = splitPath(pathname.split(/[?#]/)[0]);

  let best: (typeof TEMPLATE_SEGMENTS)[number] | null = null;
  for (const candidate of TEMPLATE_SEGMENTS) {
    if (candidate.segments.length !== segments.length) continue;
    const matches = candidate.segments.every(
      (segment, index) => segment.startsWith('[') || segment === segments[index]
    );
    if (matches && (!best || candidate.staticCount > best.staticCount)) best = candidate;
  }
  return best?.template ?? UNMATCHED_ROUTE;
}

// ─── Property hygiene ──────────────────────────────────────────────────────

const BLOCKED_KEY =
  /(?:^|_)(?:e?mail|phone|password|passcode|token|secret|authorization|api_key|cookie|name|first_name|last_name|full_name|user_name|username|message|description|comment|query)(?:_|$)/;
// Flags and counts describe a value without carrying it: `has_query`, `query_length`.
const DERIVED_KEY = /^(?:has|is)_|_(?:count|length)$/;
const MAX_STRING_LENGTH = 200;
const MAX_ARRAY_LENGTH = 50;
const MAX_DEPTH = 3;

const toSnakeCase = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

/** Whether a property key could hold personal details or free text, which events must not carry. */
export const isBlockedPropertyKey = (key: string) => {
  const snakeKey = toSnakeCase(key);
  return !DERIVED_KEY.test(snakeKey) && BLOCKED_KEY.test(snakeKey);
};

const sanitizeValue = (value: unknown, depth: number): unknown => {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return value.slice(0, MAX_STRING_LENGTH);
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_LENGTH)
      .map(item => sanitizeValue(item, depth + 1))
      .filter(item => item !== undefined);
  }
  if (typeof value === 'object' && depth < MAX_DEPTH) {
    return sanitizeProperties(value as Record<string, unknown>, depth + 1);
  }
  return undefined;
};

/**
 * Drops keys that could carry personal details or typed text, and anything that isn't plain data.
 * Strings are cut to 200 characters and arrays to 50 items.
 */
export function sanitizeProperties(
  properties: Record<string, unknown> | undefined,
  depth = 0
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  if (!properties) return sanitized;
  for (const [key, value] of Object.entries(properties)) {
    if (isBlockedPropertyKey(key)) continue;
    const clean = sanitizeValue(value, depth);
    if (clean !== undefined) sanitized[key] = clean;
  }
  return sanitized;
}

/** A URL without its query string or hash, which can hold tokens and search text. */
export function stripUrlDetails(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split(/[?#]/)[0];
  }
}

const URL_PROPERTY = /(?:url|referrer)$/i;

const stripUrlProperties = (properties: Record<string, unknown> | undefined) => {
  if (!properties) return;
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string' && URL_PROPERTY.test(key)) properties[key] = stripUrlDetails(value);
  }
};

/** Last step before an event leaves the browser: no query strings or hashes in any URL. */
export function beforeSend(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  stripUrlProperties(event.properties);
  stripUrlProperties(event.$set);
  stripUrlProperties(event.$set_once);
  return event;
}

/** Whether Vertex is running inside the desktop app rather than a browser tab. */
export const getPlatform = (): 'desktop' | 'web' => (getIsElectron() ? 'desktop' : 'web');

/**
 * Which deployment an event came from. Read from the host, because NODE_ENV is "production" on
 * staging too and NEXT_PUBLIC_ENV depends on the env file the image was built with. A page with
 * no host (the desktop app loading a local file) falls back to NEXT_PUBLIC_ENV.
 */
export function getAnalyticsEnvironment(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : ''
): string {
  const host = hostname.toLowerCase();
  if (!host) return getEnvironment();
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
    return 'development';
  }
  if (host.includes('staging') || host.includes('stage')) return 'staging';
  return 'production';
}

let userContext = 'unknown';

/**
 * Properties every event carries, PostHog's own ($pageleave, $identify, …) included. Added here
 * rather than with register() because posthog.reset() on sign-out clears registered properties.
 */
export function withAppProperties(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  event.properties = {
    app_name: ANALYTICS_APP_NAME,
    environment: getAnalyticsEnvironment(),
    platform: getPlatform(),
    user_context: userContext,
    ...event.properties,
  };
  return event;
}

// ─── Client ────────────────────────────────────────────────────────────────

type Task = (client: PostHog) => void;

const MAX_QUEUED_TASKS = 100;
const CREDENTIAL_RETRY_MS = 1000;
const MAX_CREDENTIAL_RETRIES = 60;

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
let queue: Task[] = [];
let credentialRetries = 0;
let credentialTimer: ReturnType<typeof setTimeout> | null = null;
let initScheduled = false;

export const isAnalyticsEnabled = () => Boolean(POSTHOG_KEY) && typeof window !== 'undefined';

// Sign-in hand-offs and reset links carry a token in the URL. PostHog starts once the app has
// consumed it, so neither an event nor a replay can pick it up.
const urlCarriesCredentials = () =>
  /(?:^|[#?&])[^=&#]*token[^=&#]*=/i.test(`${window.location.search}${window.location.hash}`);

const posthogConfig = (): Partial<PostHogConfig> => ({
  api_host: POSTHOG_HOST,
  autocapture: false,
  rageclick: false,
  capture_dead_clicks: false,
  capture_pageview: false,
  capture_pageleave: true,
  persistence: 'localStorage+cookie',
  person_profiles: 'identified_only',
  // Replay is switched on and off in the PostHog project settings.
  disable_session_recording: false,
  session_recording: { maskAllInputs: true },
  internal_or_test_user_hostname: /^(localhost|127\.0\.0\.1|.+\.localhost)$/,
  before_send: [withAppProperties, beforeSend],
});

function flushQueue(posthog: PostHog) {
  const pending = queue;
  queue = [];
  for (const task of pending) {
    try {
      task(posthog);
    } catch (error) {
      console.warn('Analytics call failed:', error);
    }
  }
}

/** Loads and starts PostHog once. Safe to call repeatedly; does nothing without a key. */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || loading || credentialTimer) return;

  if (urlCarriesCredentials()) {
    if (credentialRetries++ < MAX_CREDENTIAL_RETRIES) {
      credentialTimer = setTimeout(() => {
        credentialTimer = null;
        initAnalytics();
      }, CREDENTIAL_RETRY_MS);
    } else {
      // Gave up on this page; the next call from a clean page tries again
      credentialRetries = 0;
      initScheduled = false;
    }
    return;
  }

  loading = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, posthogConfig());
      client = posthog;
      flushQueue(posthog);
      return posthog;
    })
    .catch(error => {
      // Blocked by an extension or offline: drop what was waiting and carry on without analytics.
      console.warn('Analytics failed to load:', error);
      queue = [];
      return null;
    });
}

// The first call starts the load once the browser is idle, after the page's own requests.
function scheduleInit() {
  if (initScheduled) return;
  initScheduled = true;
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => initAnalytics(), { timeout: 3000 });
  } else {
    setTimeout(initAnalytics, 1000);
  }
}

function withClient(task: Task) {
  if (!isAnalyticsEnabled()) return;
  if (client) {
    try {
      task(client);
    } catch (error) {
      console.warn('Analytics call failed:', error);
    }
    return;
  }
  if (queue.length < MAX_QUEUED_TASKS) queue.push(task);
  scheduleInit();
}

export type { TrackOptions };

/** Records a completed action. Properties pass through sanitizeProperties(). */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
  options: TrackOptions = {}
): void {
  if (!isAnalyticsEnabled()) return;
  // Read the page now, not when a queued call finally runs.
  const route = getRouteTemplate(window.location.pathname);
  withClient(posthog =>
    posthog.capture(
      event,
      { ...sanitizeProperties(properties), route },
      options.sendNow ? { transport: 'sendBeacon' } : undefined
    )
  );
}

/** Records a page view under its route template; query strings and hashes are left out. */
export function trackPageview(pathname: string): void {
  if (!isAnalyticsEnabled()) return;
  const route = getRouteTemplate(pathname);
  const url = `${window.location.origin}${pathname}`;
  withClient(posthog => posthog.capture('$pageview', { $current_url: url, route }));
}

export interface AnalyticsPerson {
  id: string;
  /** Platform-wide privilege such as "user" or "super_admin". */
  privilege?: string;
  country?: string;
}

/** Ties this browser's events to a signed-in user. Only the stable id and a few attributes are sent. */
export function identifyUser({ id, privilege, country }: AnalyticsPerson): void {
  withClient(posthog => {
    const personProperties = sanitizeProperties({ vertex_privilege: privilege, country });
    if (posthog.get_distinct_id() === id) {
      posthog.setPersonProperties(personProperties);
      return;
    }
    // Someone else was signed in on this browser: start fresh so their history isn't joined to this
    // person. (Signing out reloads the page, so this is how a second account is noticed.)
    if (posthog.get_property('$user_state') === 'identified') posthog.reset();
    posthog.identify(id, personProperties);
  });
}

export interface AnalyticsOrganization {
  id: string;
  title?: string;
  slug?: string;
}

/**
 * Associates events with the active organisation, and records whether the user is in their
 * personal context or an organisation's. Uses PostHog's `organization` group type, the same one
 * Nexus uses, so one organisation's activity can be followed across AirQo apps.
 */
export function setActiveOrganization(
  organization: AnalyticsOrganization | null,
  context: string | null
): void {
  userContext = context ?? 'unknown';
  withClient(posthog => {
    if (!organization) {
      posthog.resetGroups();
      return;
    }
    posthog.group('organization', organization.id, {
      name: organization.title,
      ...(organization.slug ? { slug: organization.slug } : {}),
    });
  });
}

/** Forgets the signed-in user on sign-out, so the next person on this browser starts fresh. */
export function resetAnalytics(): void {
  withClient(posthog => posthog.reset());
}

// ─── Sign-in ───────────────────────────────────────────────────────────────

const SIGN_IN_KEY = 'vertex_analytics_sign_in';
// An attempt older than this was abandoned; its start time would make the duration meaningless
const SIGN_IN_MAX_AGE_MS = 10 * 60 * 1000;

interface PendingSignIn {
  method: string;
  startedAt: number | null;
  markedAt: number;
}

const readPendingSignIn = (): PendingSignIn | null => {
  try {
    const raw = sessionStorage.getItem(SIGN_IN_KEY);
    const parsed = raw ? (JSON.parse(raw) as PendingSignIn) : null;
    if (!parsed || typeof parsed.method !== 'string') return null;
    return Date.now() - parsed.markedAt < SIGN_IN_MAX_AGE_MS ? parsed : null;
  } catch {
    return null;
  }
};

const writePendingSignIn = (signIn: PendingSignIn) => {
  try {
    sessionStorage.setItem(SIGN_IN_KEY, JSON.stringify(signIn));
  } catch {
    // Storage blocked: this sign-in just won't be reported
  }
};

/**
 * Notes that the user started signing in ("password", "google", …). sessionStorage survives the
 * redirect, and the first signed-in page reports `user_signed_in` once.
 */
export function startSignIn(method: string): void {
  if (typeof window === 'undefined') return;
  writePendingSignIn({ method, startedAt: Date.now(), markedAt: Date.now() });
}

/**
 * Notes a sign-in finishing without the login form: an OAuth hand-off (which keeps the start time
 * from the provider button, if there was one) or a session picked up from the AirQo platform.
 */
export function completeSignIn(method: string): void {
  if (typeof window === 'undefined') return;
  const started = readPendingSignIn();
  writePendingSignIn({ method, startedAt: started?.startedAt ?? null, markedAt: Date.now() });
}

/** Forgets a sign-in that didn't go through. */
export function clearPendingSignIn(): void {
  try {
    sessionStorage.removeItem(SIGN_IN_KEY);
  } catch {
    // Nothing to clear
  }
}

/** The sign-in that just finished, if any, forgotten once read. */
export function consumePendingSignIn(): { method: string; duration_ms: number | null } | null {
  if (typeof window === 'undefined') return null;
  const signIn = readPendingSignIn();
  clearPendingSignIn();
  if (!signIn) return null;
  return {
    method: signIn.method,
    duration_ms: signIn.startedAt ? Date.now() - signIn.startedAt : null,
  };
}

// Every other module calls these through lib/track.ts
connectAnalytics({ trackEvent, startSignIn, completeSignIn, clearPendingSignIn, resetAnalytics });
