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
