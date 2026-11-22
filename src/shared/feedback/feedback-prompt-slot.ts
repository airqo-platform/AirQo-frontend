'use client';

import { useEffect, useState } from 'react';

/**
 * Each app has two satisfaction prompts — the post-login popup and the page
 * satisfaction banner — and only one may be on screen at a time: whichever
 * prompt is showing claims the slot, and the other one stays hidden until it
 * is released.
 *
 * Copied from beacon/components/features/feedback/feedback-prompt-slot.ts.
 * vertex/components/features/feedback/feedback-prompt-slot.ts is the same code;
 * only this comment differed. Nexus has no satisfaction prompts.
 */

const listeners = new Set<() => void>();
let holder: string | null = null;

const notify = (): void => {
  listeners.forEach(listener => listener());
};

/** Takes the slot for `id`. The previous holder loses it. */
export const claimFeedbackPromptSlot = (id: string): void => {
  if (holder === id) return;
  holder = id;
  notify();
};

/** Frees the slot, but only if `id` still holds it. */
export const releaseFeedbackPromptSlot = (id: string): void => {
  if (holder !== id) return;
  holder = null;
  notify();
};

/** Id of the prompt currently holding the slot, or null while it is free. */
export const useFeedbackPromptSlot = (): string | null => {
  const [current, setCurrent] = useState<string | null>(holder);

  useEffect(() => {
    const listener = () => setCurrent(holder);
    listeners.add(listener);
    // The slot may have been claimed before this subscription was set up.
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return current;
};
