/**
 * Browser-side bookkeeping for the satisfaction prompts: when they may ask
 * again, and when the current sign-in started.
 *
 * Copied from beacon/lib/feedback-preferences.ts. Vertex keeps the same
 * functions in core/utils/userPreferences.ts with `vertex_` keys instead of
 * `beacon_`, so the key prefix is now an option: `createFeedbackPreferences()`
 * returns the same functions bound to one prefix (Beacon's by default). The app
 * passes its prefix to the banner and the login toast, and calls
 * `markLoginStarted` from its login page with the same prefix.
 *
 * Key names must not contain "auth", "token" or "user": Beacon's
 * authService.clearAllAuthData() deletes any storage key containing those words
 * on every sign-in and sign-out, which would reset these cooldowns each time.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const isBrowser = (): boolean => typeof window !== "undefined"

/** How long the post-login prompt stays away after it was answered or closed. */
export const LOGIN_FEEDBACK_COOLDOWN_MS = 30 * DAY_MS

/** How long a page stays quiet after it has been asked about. */
export const PAGE_SATISFACTION_COOLDOWN_MS = 30 * DAY_MS

export const DEFAULT_FEEDBACK_KEY_PREFIX = "beacon"

export interface LoginFeedbackRecord {
  submittedAt: number
  expiresAt: number
}

/** Page key -> timestamp the suppression expires at. */
type PageSatisfactionRecords = Record<string, number>

export interface FeedbackPreferences {
  getLoginFeedbackRecord: (personId: string) => LoginFeedbackRecord | null
  setLoginFeedbackRecord: (personId: string) => void
  markLoginStarted: () => void
  consumeLoginStartedAt: () => number | null
  isPageSatisfactionSuppressed: (pageKey: string) => boolean
  suppressPageSatisfaction: (pageKey: string) => void
  suppressPageSatisfactionForSession: () => void
}

export const createFeedbackPreferences = (
  keyPrefix: string = DEFAULT_FEEDBACK_KEY_PREFIX
): FeedbackPreferences => {
  // ===========================================================
  // Post-login prompt
  // ===========================================================
  const LOGIN_FEEDBACK_KEY = `${keyPrefix}_login_feedback`
  const LOGIN_STARTED_AT_KEY = `${keyPrefix}_login_started_at`

  /** The stored post-login record for a person, or null if none or already expired. */
  const getLoginFeedbackRecord = (personId: string): LoginFeedbackRecord | null => {
    if (!isBrowser() || !personId) return null
    try {
      const raw = localStorage.getItem(`${LOGIN_FEEDBACK_KEY}_${personId}`)
      if (!raw) return null
      const record: LoginFeedbackRecord = JSON.parse(raw)
      if (typeof record?.expiresAt !== "number" || Date.now() > record.expiresAt) {
        localStorage.removeItem(`${LOGIN_FEEDBACK_KEY}_${personId}`)
        return null
      }
      return record
    } catch {
      return null
    }
  }

  /** Keeps the post-login prompt away from this person for the cooldown. */
  const setLoginFeedbackRecord = (personId: string): void => {
    if (!isBrowser() || !personId) return
    const now = Date.now()
    const record: LoginFeedbackRecord = {
      submittedAt: now,
      expiresAt: now + LOGIN_FEEDBACK_COOLDOWN_MS,
    }
    try {
      localStorage.setItem(`${LOGIN_FEEDBACK_KEY}_${personId}`, JSON.stringify(record))
    } catch {
      // Storage full or blocked — the prompt may ask again next sign-in.
    }
  }

  /**
   * Notes that a sign-in has just been submitted. sessionStorage survives the
   * redirect into the dashboard, where the post-login prompt picks it up.
   */
  const markLoginStarted = (): void => {
    if (!isBrowser()) return
    try {
      sessionStorage.setItem(LOGIN_STARTED_AT_KEY, String(Date.now()))
    } catch {
      // Storage blocked — this sign-in just won't be followed by the prompt.
    }
  }

  /**
   * Returns when the sign-in started and forgets it, so the post-login prompt is
   * offered once per sign-in rather than on every reload. Null when this page
   * load did not follow a sign-in.
   */
  const consumeLoginStartedAt = (): number | null => {
    if (!isBrowser()) return null
    try {
      const raw = sessionStorage.getItem(LOGIN_STARTED_AT_KEY)
      sessionStorage.removeItem(LOGIN_STARTED_AT_KEY)
      const startedAt = Number(raw)
      return raw && Number.isFinite(startedAt) && startedAt > 0 ? startedAt : null
    } catch {
      return null
    }
  }

  // ===========================================================
  // Page satisfaction banner
  // ===========================================================
  const PAGE_SATISFACTION_KEY = `${keyPrefix}_page_satisfaction`
  const PAGE_SATISFACTION_SESSION_KEY = `${keyPrefix}_page_satisfaction_session`

  const readPageSatisfactionRecords = (): PageSatisfactionRecords => {
    if (!isBrowser()) return {}
    try {
      const raw = localStorage.getItem(PAGE_SATISFACTION_KEY)
      if (!raw) return {}
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== "object") return {}
      const now = Date.now()
      // Drop expired entries as we read so the map doesn't grow without bound.
      return Object.entries(parsed as Record<string, unknown>).reduce<PageSatisfactionRecords>(
        (records, [page, expiresAt]) => {
          if (typeof expiresAt === "number" && expiresAt > now) {
            records[page] = expiresAt
          }
          return records
        },
        {}
      )
    } catch {
      return {}
    }
  }

  /** True when the satisfaction banner should stay hidden on this page. */
  const isPageSatisfactionSuppressed = (pageKey: string): boolean => {
    if (!isBrowser() || !pageKey) return true
    try {
      if (sessionStorage.getItem(PAGE_SATISFACTION_SESSION_KEY) === "true") return true
    } catch {
      // sessionStorage unavailable — fall back to the per-page record.
    }
    return Boolean(readPageSatisfactionRecords()[pageKey])
  }

  /** Keeps the banner off a single page for the cooldown. */
  const suppressPageSatisfaction = (pageKey: string): void => {
    if (!isBrowser() || !pageKey) return
    try {
      const records = readPageSatisfactionRecords()
      records[pageKey] = Date.now() + PAGE_SATISFACTION_COOLDOWN_MS
      localStorage.setItem(PAGE_SATISFACTION_KEY, JSON.stringify(records))
    } catch {
      // Storage full or blocked — the banner still hides for this page view.
    }
  }

  /** Keeps the banner off every page until this browser session ends. */
  const suppressPageSatisfactionForSession = (): void => {
    if (!isBrowser()) return
    try {
      sessionStorage.setItem(PAGE_SATISFACTION_SESSION_KEY, "true")
    } catch {
      // Storage blocked — the per-page record still applies.
    }
  }

  return {
    getLoginFeedbackRecord,
    setLoginFeedbackRecord,
    markLoginStarted,
    consumeLoginStartedAt,
    isPageSatisfactionSuppressed,
    suppressPageSatisfaction,
    suppressPageSatisfactionForSession,
  }
}
