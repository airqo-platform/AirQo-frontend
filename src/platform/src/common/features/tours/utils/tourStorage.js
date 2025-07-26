// Use localStorage for persistence across sessions/browsers (until manually cleared)
// next-auth might clear its own data on sign-out, but standard localStorage usually persists.
// If next-auth explicitly clears all localStorage, you might need to use a different strategy
// like storing in a cookie with a longer expiry or on the backend.
const STORAGE_KEY_PREFIX = 'user_tour_status_'; // Prefix for user-specific keys
// const GLOBAL_STORAGE_KEY = 'app_global_tour_settings';
/**
 * Generates a storage key specific to the user and tour.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 * @returns {string|null} - The storage key or null if userId is missing.
 */
const getUserTourStorageKey = (tourKey, userId) => {
  if (!userId) {
    console.warn(
      'tourStorage: User ID is required to generate a user-specific key.',
    );
    return null;
  }
  return `${STORAGE_KEY_PREFIX}${userId}_${tourKey}`;
};

/**
 * Marks a tour as seen for a specific user.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 */
export const markTourAsSeen = (tourKey, userId) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('tourStorage: localStorage is not available.');
    return;
  }

  const storageKey = getUserTourStorageKey(tourKey, userId);
  if (!storageKey) return; // Don't proceed if key couldn't be generated

  try {
    const statusData = {
      seen: true,
      timestamp: new Date().toISOString(),
      // Potentially add versioning or other metadata later
    };
    localStorage.setItem(storageKey, JSON.stringify(statusData));
    console.log(
      `tourStorage: Marked tour '${tourKey}' as seen for user '${userId}'.`,
    );
  } catch (e) {
    console.error(
      `tourStorage: Failed to save status for tour '${tourKey}' for user '${userId}':`,
      e,
    );
  }
};

/**
 * Checks if a tour has been seen by a specific user.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 * @returns {boolean} - True if the tour has been seen, false otherwise or on error.
 */
export const isTourSeen = (tourKey, userId) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('tourStorage: localStorage is not available.');
    return false;
  }

  const storageKey = getUserTourStorageKey(tourKey, userId);
  if (!storageKey) return false; // Default to not seen if key couldn't be generated

  try {
    const item = localStorage.getItem(storageKey);
    if (item) {
      const data = JSON.parse(item);
      return data.seen === true;
    }
  } catch (e) {
    console.error(
      `tourStorage: Failed to read status for tour '${tourKey}' for user '${userId}':`,
      e,
    );
  }
  return false; // Default to not seen if check fails or item not found
};

/**
 * (Optional) Clears the seen status for a specific tour for a user.
 * Useful for development/testing or user-initiated reset.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 */
export const clearTourStatus = (tourKey, userId) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const storageKey = getUserTourStorageKey(tourKey, userId);
  if (storageKey) {
    try {
      localStorage.removeItem(storageKey);
      console.log(
        `tourStorage: Cleared status for tour '${tourKey}' for user '${userId}'.`,
      );
    } catch (e) {
      console.error(
        `tourStorage: Failed to clear status for tour '${tourKey}' for user '${userId}':`,
        e,
      );
    }
  }
};

/**
 * (Optional) Clears ALL tour statuses for a specific user.
 * Useful if tours are significantly updated and need a reset.
 * @param {string} userId - The user's ID from the session.
 */
export const clearAllUserTourStatuses = (userId) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const prefix = `${STORAGE_KEY_PREFIX}${userId}_`;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
    console.log(`tourStorage: Cleared all tour statuses for user '${userId}'.`);
  } catch (e) {
    console.error(
      `tourStorage: Failed to clear all statuses for user '${userId}':`,
      e,
    );
  }
};
