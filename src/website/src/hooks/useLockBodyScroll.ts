/**
 * Simple ref-counted body scroll lock hook.
 *
 * When `enabled` is true this increments a global lock count and sets
 * `document.body.style.overflow = 'hidden'` when the first lock is acquired.
 * When the count reaches zero the overflow is restored to ''.
 */
import { useEffect } from 'react';

const LOCK_KEY = '__airqo_body_scroll_lock_count__';
const LOCK_PREV_KEY = `${LOCK_KEY}_prev`;

function incrementLock() {
  const w = window as any;
  w[LOCK_KEY] = (w[LOCK_KEY] || 0) + 1;
  if (w[LOCK_KEY] === 1) {
    try {
      // Save existing inline overflow value so we can restore it later.
      // This intentionally writes the save once when transitioning 0 -> 1.
      w[LOCK_PREV_KEY] = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } catch {}
  }
}

function decrementLock() {
  const w = window as any;
  w[LOCK_KEY] = Math.max((w[LOCK_KEY] || 0) - 1, 0);
  if (w[LOCK_KEY] === 0) {
    try {
      const prev = w[LOCK_PREV_KEY];
      // Restore the saved inline overflow value. If nothing was saved,
      // clear the inline overflow to leave computed styles intact.
      document.body.style.overflow = typeof prev === 'undefined' ? '' : prev;
    } catch {}
    try {
      // Clean up the temporary saved value.
      delete w[LOCK_PREV_KEY];
    } catch {}
  }
}

export default function useLockBodyScroll(enabled: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) return;
    incrementLock();
    return () => {
      decrementLock();
    };
  }, [enabled]);
}
