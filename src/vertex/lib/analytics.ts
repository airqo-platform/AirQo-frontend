/**
 * Product analytics for Vertex, sent to PostHog.
 *
 * - Nothing is sent unless NEXT_PUBLIC_POSTHOG_KEY is set in the server's environment
 *   (read when the server runs, see lib/public-env.ts).
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
import { connectAnalytics, type SignInOptions, type TrackOptions } from '@/lib/track';
import { getPublicEnv } from '@/lib/public-env';

export const ANALYTICS_APP_NAME = 'vertex';

const POSTHOG_KEY = getPublicEnv('NEXT_PUBLIC_POSTHOG_KEY') || '';
const POSTHOG_HOST = getPublicEnv('NEXT_PUBLIC_POSTHOG_HOST') || 'https://us.i.posthog.com';

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

/**
 * Whether a property key could hold personal details or free text, which events must not carry.
 * A flag (`has_query`) or count (`query_length`) is allowed only with a boolean or number value, so
 * `has_email: "someone@example.com"` is still dropped.
 */
export const isBlockedPropertyKey = (key: string, value?: unknown) => {
  const snakeKey = toSnakeCase(key);
  if (!BLOCKED_KEY.test(snakeKey)) return false;
  if (!DERIVED_KEY.test(snakeKey)) return true;
  const isFlag = /^(?:has|is)_/.test(snakeKey);
  return isFlag ? typeof value !== 'boolean' : typeof value !== 'number';
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
    if (isBlockedPropertyKey(key, value)) continue;
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

// Campaign and click-id parameters PostHog copies out of URLs, also as `$initial_*` person
// properties and `$session_entry_*` session properties. Their values are whatever the URL held.
const CAMPAIGN_PROPERTY =
  /^(?:\$initial_|\$session_entry_)?(?:utm_[a-z_]+|gad_source|mc_cid|gclid|gclsrc|dclid|gbraid|wbraid|fbclid|msclkid|twclid|li_fat_id|igshid|ttclid|rdt_cid|epik|qclid|sccid|irclid|_kx)$/i;

const dropCampaignProperties = (properties: Record<string, unknown> | undefined) => {
  if (!properties) return;
  for (const key of Object.keys(properties)) {
    if (CAMPAIGN_PROPERTY.test(key)) delete properties[key];
  }
};

/**
 * Last step before an event leaves the browser: no query strings or hashes in any URL, and no
 * campaign parameters copied out of one.
 */
export function beforeSend(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  for (const properties of [event.properties, event.$set, event.$set_once]) {
    stripUrlProperties(properties);
    dropCampaignProperties(properties);
  }
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
const MAX_LOAD_ATTEMPTS = 3;
const CREDENTIAL_RETRY_MS = 1000;
const MAX_CREDENTIAL_RETRIES = 60;

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
let queue: Task[] = [];
let credentialRetries = 0;
let credentialTimer: ReturnType<typeof setTimeout> | null = null;
let initScheduled = false;
let failedLoads = 0;

export const isAnalyticsEnabled = () =>
  Boolean(POSTHOG_KEY) && typeof window !== 'undefined' && failedLoads < MAX_LOAD_ATTEMPTS;

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
  // UTM and click-id values come from the URL and can carry anything; they aren't used here
  save_campaign_params: false,
  // Replay is switched on and off in the PostHog project settings. The recorder passes page URLs
  // (and captured request URLs) through this hook, so replays lose query strings and hashes too.
  disable_session_recording: false,
  session_recording: {
    maskAllInputs: true,
    maskCapturedNetworkRequestFn: request => ({ ...request, name: stripUrlDetails(request.name) }),
  },
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
      // Offline or blocked. Keep what was waiting, the user's identify included, and let the next
      // call try again; after a few failures, drop it and carry on without analytics.
      console.warn('Analytics failed to load:', error);
      loading = null;
      initScheduled = false;
      if (++failedLoads >= MAX_LOAD_ATTEMPTS) queue = [];
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

/**
 * Runs `task` now, or queues it until PostHog loads. Events are capped at MAX_QUEUED_TASKS;
 * identity calls (`essential`) are always kept, since the provider won't repeat them.
 */
function withClient(task: Task, { essential = false } = {}) {
  if (!isAnalyticsEnabled()) return;
  if (client) {
    try {
      task(client);
    } catch (error) {
      console.warn('Analytics call failed:', error);
    }
    return;
  }
  if (essential || queue.length < MAX_QUEUED_TASKS) queue.push(task);
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
  const route = getRouteTemplate(options.pathname ?? window.location.pathname);
  withClient(posthog =>
    posthog.capture(
      event,
      { ...sanitizeProperties(properties), route },
      // posthog-js ignores `transport` on capture; send_instantly skips the batch, and its
      // fetch keepalive request survives the page unloading
      options.sendNow ? { send_instantly: true } : undefined
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
  }, { essential: true });
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
  withClient(posthog => {
    // Set here, in queue order, so events queued before the switch keep the context they had
    userContext = context ?? 'unknown';
    if (!organization) {
      posthog.resetGroups();
      return;
    }
    // Group properties don't pass through sanitizeProperties(): it would drop `name` (see BLOCKED_KEY)
    posthog.group('organization', organization.id, {
      name: organization.title,
      ...(organization.slug ? { slug: organization.slug } : {}),
    });
  }, { essential: true });
}

/**
 * Removes PostHog's stored identity directly. Used when signing out before PostHog has loaded on
 * this page: the queued reset would be lost with the page, and the next page would restore the
 * previous user's id from PostHog's cookie.
 */
function forgetStoredIdentity(): void {
  const name = `ph_${POSTHOG_KEY}_posthog`;
  try {
    localStorage.removeItem(name);
  } catch {
    // Storage blocked: nothing stored there
  }
  // PostHog sets its cookie on the parent domain (.airqo.net) so it's shared across subdomains
  const labels = window.location.hostname.split('.');
  const domains = [''].concat(
    labels.slice(0, -1).map((_, index) => `; domain=.${labels.slice(index).join('.')}`)
  );
  for (const domain of domains) {
    document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}

/** Forgets the signed-in user on sign-out, so the next person on this browser starts fresh. */
export function resetAnalytics(): void {
  // Not isAnalyticsEnabled(): after three failed loads it's false, but the stored id must still go
  if (!POSTHOG_KEY || typeof window === 'undefined') return;
  if (!client) forgetStoredIdentity();
  withClient(
    posthog => {
      userContext = 'unknown';
      posthog.reset();
    },
    { essential: true }
  );
}

// ─── Sign-in ───────────────────────────────────────────────────────────────

const SIGN_IN_KEY = 'vertex_analytics_sign_in';
// An attempt older than this was abandoned; its start time would make the duration meaningless
const SIGN_IN_MAX_AGE_MS = 10 * 60 * 1000;

interface PendingSignIn {
  method: string;
  startedAt: number | null;
  markedAt: number;
  /** False for an OAuth click until the hand-off completes; only confirmed sign-ins are reported. */
  confirmed: boolean;
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
export function startSignIn(method: string, { awaitingHandoff = false }: SignInOptions = {}): void {
  if (typeof window === 'undefined') return;
  writePendingSignIn({
    method,
    startedAt: Date.now(),
    markedAt: Date.now(),
    confirmed: !awaitingHandoff,
  });
}

/**
 * Notes a sign-in finishing without the login form: an OAuth hand-off (which keeps the start time
 * from the provider button, if there was one) or a session picked up from the AirQo platform.
 */
export function completeSignIn(method: string): void {
  if (typeof window === 'undefined') return;
  // Only a start from the same method times this sign-in (a Google click doesn't time an SSO pickup)
  const started = readPendingSignIn();
  writePendingSignIn({
    method,
    startedAt: started?.method === method ? started.startedAt : null,
    markedAt: Date.now(),
    confirmed: true,
  });
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
  if (!signIn?.confirmed) return null;
  const elapsed = signIn.startedAt ? Date.now() - signIn.startedAt : null;
  return {
    method: signIn.method,
    // A start older than the window is from an abandoned attempt, not this sign-in
    duration_ms: elapsed !== null && elapsed < SIGN_IN_MAX_AGE_MS ? elapsed : null,
  };
}

// Every other module calls these through lib/track.ts
connectAnalytics({ trackEvent, startSignIn, completeSignIn, clearPendingSignIn, resetAnalytics });
