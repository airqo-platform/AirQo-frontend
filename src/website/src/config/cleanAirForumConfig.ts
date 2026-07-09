/**
 * Config for the Clean Air Forum conference wall display.
 *
 * The wall page (`/faces-of-clean-air`) and the mobile app's submission flow both
 * need to agree on which forum edition is "current".
 */
export const CLEAN_AIR_FORUM_CURRENT_EVENT_ID = 'clean-air-forum-2026';

/**
 * How often the wall page polls for new submissions when the tab is active.
 * 45 seconds balances responsiveness for the booth scenario with server load.
 * Pauses entirely when the tab is hidden (Page Visibility API).
 */
export const CLEAN_AIR_FORUM_WALL_ACTIVE_POLL_INTERVAL_MS = 45 * 1000;

/**
 * Fallback polling interval used when the Page Visibility API is unavailable.
 */
export const CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS = 2 * 60 * 1000;
