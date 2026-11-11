/**
 * What the rest of Vertex imports to record analytics events. Import this, not lib/analytics.
 *
 * lib/analytics.ts is imported only by the root layout's AnalyticsProvider and plugs itself in
 * here when it loads. This file stays tiny and import-free on purpose. Webpack copies a module this
 * small into each route chunk instead of giving it a chunk of its own. A new shared chunk would push
 * the device list routes past their initial-chunk limit, and webpack would then copy other shared
 * code into them, which breaks the size-limit budget (docs/POSTHOG_ANALYTICS.md).
 */

export interface TrackOptions {
  /** Send straight away by beacon, for an action that ends in a full page load or sign-out. */
  sendNow?: boolean;
}

export interface AnalyticsBridge {
  trackEvent: (event: string, properties?: Record<string, unknown>, options?: TrackOptions) => void;
  startSignIn: (method: string) => void;
  completeSignIn: (method: string) => void;
  clearPendingSignIn: () => void;
  resetAnalytics: () => void;
}

const MAX_PENDING = 50;

let bridge: AnalyticsBridge | null = null;
let pending: Array<(connected: AnalyticsBridge) => void> = [];

const call = (task: (connected: AnalyticsBridge) => void) => {
  if (bridge) {
    task(bridge);
  } else if (pending.length < MAX_PENDING) {
    pending.push(task);
  }
};

/** Called once by lib/analytics.ts as it loads; replays anything recorded before then. */
export function connectAnalytics(connected: AnalyticsBridge): void {
  bridge = connected;
  const waiting = pending;
  pending = [];
  waiting.forEach(task => task(connected));
}

/** Records a completed action. See lib/analytics.ts for what is kept and what is dropped. */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
  options?: TrackOptions
): void {
  call(connected => connected.trackEvent(event, properties, options));
}

/** Notes that the user started signing in ("password", "google", …). */
export function startSignIn(method: string): void {
  call(connected => connected.startSignIn(method));
}

/** Notes a sign-in finishing without the login form (OAuth hand-off, platform session). */
export function completeSignIn(method: string): void {
  call(connected => connected.completeSignIn(method));
}

/** Forgets a sign-in that didn't go through. */
export function clearPendingSignIn(): void {
  call(connected => connected.clearPendingSignIn());
}

/** Forgets the signed-in user on sign-out, so the next person on this browser starts fresh. */
export function resetAnalytics(): void {
  call(connected => connected.resetAnalytics());
}

/** Which AirQo app a link opens, for `app_link_opened`. */
export function getAppDestination(url: string): string {
  let host = '';
  try {
    host = new URL(url, 'https://vertex.invalid').hostname.toLowerCase();
  } catch {
    return 'other';
  }
  if (host.includes('beacon')) return 'beacon';
  if (host.includes('analytics') || host.includes('nexus')) return 'nexus';
  if (host.includes('airqalibrate') || host.includes('calibrate')) return 'calibrate';
  if (host.startsWith('docs.')) return 'api_docs';
  if (host.startsWith('ai.')) return 'ai_platform';
  if (host === 'airqo.net' || host === 'www.airqo.net') return 'website';
  return 'other';
}
