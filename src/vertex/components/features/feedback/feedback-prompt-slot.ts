'use client';

import { useEffect, useState } from 'react';

/**
 * Vertex has two satisfaction prompts that both live in the bottom-right
 * corner — the post-login popup and the page satisfaction banner — and they
 * used to overlap. Only one may be on screen at a time: whichever prompt is
 * showing claims the slot, and the other one stays hidden until it is released.
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
