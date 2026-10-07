/**
 * Browser-side bookkeeping for Beacon's satisfaction prompts: when they may ask
 * again, and when the current sign-in started.
 *
 * Key names must not contain "auth", "token" or "user": authService's
 * clearAllAuthData() deletes any storage key containing those words on every
 * sign-in and sign-out, which would reset these cooldowns each time.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const isBrowser = (): boolean => typeof window !== "undefined"

// ===========================================================
// Post-login prompt
// ===========================================================
const LOGIN_FEEDBACK_KEY = "beacon_login_feedback"
const LOGIN_STARTED_AT_KEY = "beacon_login_started_at"

/** How long the post-login prompt stays away after it was answered or closed. */
export const LOGIN_FEEDBACK_COOLDOWN_MS = 30 * DAY_MS

export interface LoginFeedbackRecord {
  submittedAt: number
  expiresAt: number
}

/** The stored post-login record for a person, or null if none or already expired. */
export const getLoginFeedbackRecord = (personId: string): LoginFeedbackRecord | null => {
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
export const setLoginFeedbackRecord = (personId: string): void => {
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
export const markLoginStarted = (): void => {
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
export const consumeLoginStartedAt = (): number | null => {
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
const PAGE_SATISFACTION_KEY = "beacon_page_satisfaction"
const PAGE_SATISFACTION_SESSION_KEY = "beacon_page_satisfaction_session"

/** How long a page stays quiet after it has been asked about. */
export const PAGE_SATISFACTION_COOLDOWN_MS = 30 * DAY_MS

/** Page key -> timestamp the suppression expires at. */
type PageSatisfactionRecords = Record<string, number>

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
export const isPageSatisfactionSuppressed = (pageKey: string): boolean => {
  if (!isBrowser() || !pageKey) return true
  try {
    if (sessionStorage.getItem(PAGE_SATISFACTION_SESSION_KEY) === "true") return true
  } catch {
    // sessionStorage unavailable — fall back to the per-page record.
  }
  return Boolean(readPageSatisfactionRecords()[pageKey])
}

/** Keeps the banner off a single page for the cooldown. */
export const suppressPageSatisfaction = (pageKey: string): void => {
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
export const suppressPageSatisfactionForSession = (): void => {
  if (!isBrowser()) return
  try {
    sessionStorage.setItem(PAGE_SATISFACTION_SESSION_KEY, "true")
  } catch {
    // Storage blocked — the per-page record still applies.
  }
}
