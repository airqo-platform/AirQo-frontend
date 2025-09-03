// --- localStorage Implementation (Current) ---

import logger from '@/lib/logger';

const STORAGE_KEY_PREFIX = 'user_tour_status_';

/**
 * Generates a storage key specific to the user and tour.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 * @returns {string|null} - The storage key or null if userId is missing.
 */
const getUserTourStorageKey = (tourKey, userId) => {
  if (!userId) {
    logger.warn(
      'tourStorage: User ID is required to generate a user-specific key.',
    );
    return null;
  }
  return `${STORAGE_KEY_PREFIX}${userId}_${tourKey}`;
};

/**
 * Marks a tour as seen for a specific user using localStorage.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 */
export const markTourAsSeen = (tourKey, userId) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    logger.warn('tourStorage: localStorage is not available.');
    return;
  }

  const storageKey = getUserTourStorageKey(tourKey, userId);
  if (!storageKey) return;

  try {
    const statusData = {
      seen: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(statusData));
    logger.info(
      `tourStorage (localStorage): Marked tour '${tourKey}' as seen for user '${userId}'.`,
    );
  } catch (e) {
    logger.error(
      `tourStorage (localStorage): Failed to save status for tour '${tourKey}' for user '${userId}':`,
      e,
    );
  }
};

/**
 * Checks if a tour has been seen by a specific user using localStorage.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 * @returns {boolean} - True if the tour has been seen, false otherwise or on error.
 */
export const isTourSeen = (tourKey, userId) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    logger.warn('tourStorage: localStorage is not available.');
    return false;
  }

  const storageKey = getUserTourStorageKey(tourKey, userId);
  if (!storageKey) return false;

  try {
    const item = localStorage.getItem(storageKey);
    if (item) {
      const data = JSON.parse(item);
      return data.seen === true;
    }
  } catch (e) {
    logger.error(
      `tourStorage (localStorage): Failed to read status for tour '${tourKey}' for user '${userId}':`,
      e,
    );
  }
  return false;
};

/**
 * (Optional) Clears the seen status for a specific tour for a user (localStorage).
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 */
export const clearTourStatus = (tourKey, userId) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const storageKey = getUserTourStorageKey(tourKey, userId);
  if (storageKey) {
    try {
      localStorage.removeItem(storageKey);
      logger.info(
        `tourStorage (localStorage): Cleared status for tour '${tourKey}' for user '${userId}'.`,
      );
    } catch (e) {
      logger.error(
        `tourStorage (localStorage): Failed to clear status for tour '${tourKey}' for user '${userId}':`,
        e,
      );
    }
  }
};

/**
 * (Optional) Clears ALL tour statuses for a specific user (localStorage).
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
    logger.info(
      `tourStorage (localStorage): Cleared all tour statuses for user '${userId}'.`,
    );
  } catch (e) {
    logger.error(
      `tourStorage (localStorage): Failed to clear all statuses for user '${userId}':`,
      e,
    );
  }
};

// --- Backend Integration Template (Future Implementation) ---

/**
 * Template for marking a tour as seen via a backend API call.
 * Replace with your actual API endpoint and logic.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 * @param {string} token - Authentication token (e.g., JWT) for the API request.
 */
/*
export const markTourAsSeenBackend = async (tourKey, userId, token) => {
  if (!userId || !tourKey || !token) {
    console.warn("tourStorage (Backend): User ID, Tour Key, and Token are required.");
    return;
  }

  try {
    const response = await fetch(`/api/user/${userId}/tours/${tourKey}/seen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Or however your API expects auth
      },
      body: JSON.stringify({
        seen: true,
        timestamp: new Date().toISOString(),
        // version: TOUR_VERSION // Optional: if tracking tour versions
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`tourStorage (Backend): Successfully marked tour '${tourKey}' as seen for user '${userId}'.`, result);
    // Optionally, update local state/context if needed based on the response
  } catch (error) {
    console.error(`tourStorage (Backend): Error marking tour '${tourKey}' as seen for user '${userId}':`, error);
    // Fallback: Potentially mark in localStorage if backend fails?
    // markTourAsSeen(tourKey, userId);
  }
};
*/

/**
 * Template for checking if a tour has been seen via a backend API call.
 * Replace with your actual API endpoint and logic.
 * @param {string} tourKey - The unique key for the tour.
 * @param {string} userId - The user's ID from the session.
 * @param {string} token - Authentication token (e.g., JWT) for the API request.
 * @returns {Promise<boolean>} - Resolves to true if seen, false otherwise or on error.
 */
/*
export const isTourSeenBackend = async (tourKey, userId, token) => {
  if (!userId || !tourKey || !token) {
    console.warn("tourStorage (Backend): User ID, Tour Key, and Token are required.");
    return false;
  }

  try {
    const response = await fetch(`/api/user/${userId}/tours/${tourKey}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
         // 404 might mean "not seen" or tour data doesn't exist yet
         console.log(`tourStorage (Backend): Tour '${tourKey}' status not found for user '${userId}' (implies not seen).`);
         return false;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const seen = data.seen === true; // Assuming API returns { seen: boolean, ... }
    console.log(`tourStorage (Backend): Checked tour '${tourKey}' for user '${userId}'. Seen: ${seen}`, data);
    return seen;
  } catch (error) {
    console.error(`tourStorage (Backend): Error checking tour '${tourKey}' status for user '${userId}':`, error);
    // Fallback: Potentially check localStorage if backend fails?
    // return isTourSeen(tourKey, userId);
    return false; // Or handle error state as needed
  }
};
*/

// --- Strategy Switch (Placeholder for future implementation) ---
// You could implement a function here that decides whether to use localStorage or backend
// based on a configuration flag or feature toggle.
/*
const STORAGE_STRATEGY = 'localStorage'; // or 'backend'

export const markTourAsSeenStrategy = (tourKey, userId, token) => {
  if (STORAGE_STRATEGY === 'backend' && token) {
    return markTourAsSeenBackend(tourKey, userId, token);
  } else {
    return markTourAsSeen(tourKey, userId);
  }
};

export const isTourSeenStrategy = (tourKey, userId, token) => {
  if (STORAGE_STRATEGY === 'backend' && token) {
    return isTourSeenBackend(tourKey, userId, token);
  } else {
    return isTourSeen(tourKey, userId);
  }
};
*/
