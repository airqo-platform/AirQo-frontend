export const PREFERENCE_KEYS = {
  LAST_ACTIVE_MODULE: 'lastActiveModule',
};

export const getLastActiveModule = (identifier?: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  if (identifier) {
    return localStorage.getItem(`${PREFERENCE_KEYS.LAST_ACTIVE_MODULE}_${identifier}`);
  }
  
  return localStorage.getItem(PREFERENCE_KEYS.LAST_ACTIVE_MODULE);
};

export const setLastActiveModule = (module: string, identifier?: string) => {
  if (typeof window === 'undefined') return;
  
  if (identifier) {
    localStorage.setItem(`${PREFERENCE_KEYS.LAST_ACTIVE_MODULE}_${identifier}`, module);
  } else {
    localStorage.setItem(PREFERENCE_KEYS.LAST_ACTIVE_MODULE, module);
  }
};

export const PREFERENCE_KEYS_GROUP = {
  LAST_ACTIVE_GROUP_ID: 'lastActiveGroupId',
};

export const getLastActiveGroupId = (userId: string): string | null => {
  if (typeof window === 'undefined' || !userId) return null;
  return localStorage.getItem(`${PREFERENCE_KEYS_GROUP.LAST_ACTIVE_GROUP_ID}_${userId}`);
};

export const setLastActiveGroupId = (userId: string, groupId: string) => {
  if (typeof window === 'undefined' || !userId || !groupId) return;
  localStorage.setItem(`${PREFERENCE_KEYS_GROUP.LAST_ACTIVE_GROUP_ID}_${userId}`, groupId);
};

// ===========================================================
// Login feedback suppression helpers
// ===========================================================
const LOGIN_FEEDBACK_KEY = 'vertex_login_feedback';

export interface LoginFeedbackRecord {
  submittedAt: number;
  expiresAt: number;
}

/**
 * Returns the stored login-feedback record for a given user, or null if none /
 * already expired.
 */
export const getLoginFeedbackRecord = (userId: string): LoginFeedbackRecord | null => {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = localStorage.getItem(`${LOGIN_FEEDBACK_KEY}_${userId}`);
    if (!raw) return null;
    const record: LoginFeedbackRecord = JSON.parse(raw);
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(`${LOGIN_FEEDBACK_KEY}_${userId}`);
      return null;
    }
    return record;
  } catch {
    return null;
  }
};

/**
 * Writes a login-feedback suppression record for the given user with a 30-day TTL.
 * Call this only after a successful rating submission.
 */
export const setLoginFeedbackRecord = (userId: string): void => {
  if (typeof window === 'undefined' || !userId) return;
  const now = Date.now();
  const record: LoginFeedbackRecord = {
    submittedAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  localStorage.setItem(`${LOGIN_FEEDBACK_KEY}_${userId}`, JSON.stringify(record));
};

// ===========================================================
// Page satisfaction prompt suppression helpers
// ===========================================================
const PAGE_SATISFACTION_KEY = 'vertex_page_satisfaction';
const PAGE_SATISFACTION_SESSION_KEY = 'vertex_page_satisfaction_session';

/** How long a page stays quiet after it has been rated or dismissed. */
export const PAGE_SATISFACTION_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Page path -> timestamp the suppression expires at. */
type PageSatisfactionRecords = Record<string, number>;

const readPageSatisfactionRecords = (): PageSatisfactionRecords => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PAGE_SATISFACTION_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const now = Date.now();
    // Drop expired entries as we read so the map doesn't grow without bound.
    return Object.entries(parsed as Record<string, unknown>).reduce<PageSatisfactionRecords>(
      (records, [page, expiresAt]) => {
        if (typeof expiresAt === 'number' && expiresAt > now) {
          records[page] = expiresAt;
        }
        return records;
      },
      {}
    );
  } catch {
    return {};
  }
};

/** True when the satisfaction banner should stay hidden on this page. */
export const isPageSatisfactionSuppressed = (page: string): boolean => {
  if (typeof window === 'undefined' || !page) return true;
  try {
    if (sessionStorage.getItem(PAGE_SATISFACTION_SESSION_KEY) === 'true') return true;
  } catch {
    // sessionStorage unavailable — fall back to the per-page record.
  }
  return Boolean(readPageSatisfactionRecords()[page]);
};

/**
 * Keeps the banner off a single page for the cooldown. Call this after the page
 * has been rated or the banner dismissed.
 */
export const suppressPageSatisfaction = (page: string): void => {
  if (typeof window === 'undefined' || !page) return;
  try {
    const records = readPageSatisfactionRecords();
    records[page] = Date.now() + PAGE_SATISFACTION_COOLDOWN_MS;
    localStorage.setItem(PAGE_SATISFACTION_KEY, JSON.stringify(records));
  } catch {
    // Storage full or blocked — the banner still hides for this page view.
  }
};

/** Keeps the banner off every page until this browser session ends. */
export const suppressPageSatisfactionForSession = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PAGE_SATISFACTION_SESSION_KEY, 'true');
  } catch {
    // Storage blocked — the per-page record still applies.
  }
};
