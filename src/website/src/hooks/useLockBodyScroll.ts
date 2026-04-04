/**
 * Simple ref-counted body scroll lock hook.
 *
 * When `enabled` is true this increments a global lock count and sets
 * `document.body.style.overflow = 'hidden'` when the first lock is acquired.
 * When the count reaches zero the overflow is restored to ''.
 */
import { useEffect } from 'react';

const LOCK_KEY = '__airqo_body_scroll_lock_count__';

function incrementLock() {
  const w = window as any;
  w[LOCK_KEY] = (w[LOCK_KEY] || 0) + 1;
  if (w[LOCK_KEY] === 1) {
    try {
      document.body.style.overflow = 'hidden';
    } catch {}
  }
}

function decrementLock() {
  const w = window as any;
  w[LOCK_KEY] = Math.max((w[LOCK_KEY] || 0) - 1, 0);
  if (w[LOCK_KEY] === 0) {
    try {
      document.body.style.overflow = '';
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
