/**
 * Config for the Clean Air Forum conference wall display.
 *
 * The wall page (`/faces-of-clean-air`) and the mobile app's submission flow both
 * need to agree on which forum edition is "current".
 */
export const CLEAN_AIR_FORUM_CURRENT_EVENT_ID = 'clean-air-forum-2026';

/**
 * How often the wall page polls for new submissions. The wall is meant to
 * refresh every couple of minutes rather than feel like a live feed.
 */
export const CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS = 2 * 60 * 1000;
