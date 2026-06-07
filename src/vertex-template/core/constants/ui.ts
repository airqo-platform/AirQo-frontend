/**
 * Delay (ms) before showing a global banner after a dialog closes.
 * Allows the dialog's unmount cleanup (which clears scoped banners) to complete first.
 */
export const AFTER_DIALOG_CLOSE_MS = 100;
