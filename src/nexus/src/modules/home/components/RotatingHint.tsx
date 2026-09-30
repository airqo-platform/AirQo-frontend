'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AqArrowRight, AqLightbulb02 } from '@airqo/icons-react';
import { HOME_HINTS } from '../constants';

const HINT_INTERVAL_MS = 5600;
const HINT_FADE_MS = 220;
const RING_RADIUS = 7.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const RotatingHint = ({
  onSelect,
}: {
  onSelect: (href: string) => void;
}) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  // With reduced motion (or no matchMedia) the hint never rotates, so a
  // countdown ring would sit frozen at zero and mislead — hide it instead.
  const [isRotationDisabled, setIsRotationDisabled] = useState(false);
  const arcRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media || media.matches) {
      setIsRotationDisabled(true);
      return;
    }

    // One clock drives both the ring fill and the hint swap. They therefore
    // cannot drift apart, and the fill is recomputed from elapsed time on every
    // frame — so it self-corrects if a frame is dropped or the tab is hidden,
    // instead of freezing part-way through like a one-shot CSS transition.
    const startedAt = performance.now();
    let lastCycle = 0;
    let frame = 0;
    let swapTimer = 0;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startedAt);
      const cycle = Math.floor(elapsed / HINT_INTERVAL_MS);
      const progress = (elapsed % HINT_INTERVAL_MS) / HINT_INTERVAL_MS;

      const arc = arcRef.current;
      if (arc) {
        // Empty at 0%, full at 100% of the cycle.
        arc.style.strokeDashoffset = String(
          RING_CIRCUMFERENCE * (1 - progress)
        );
      }

      if (cycle !== lastCycle) {
        lastCycle = cycle;
        setVisible(false);
        swapTimer = window.setTimeout(() => {
          setIndex(cycle % HOME_HINTS.length);
          setVisible(true);
        }, HINT_FADE_MS);
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(swapTimer);
    };
  }, []);

  const hint = HOME_HINTS[index];

  return (
    <div className="relative flex h-full min-h-28 flex-col justify-between overflow-hidden rounded-xl border border-primary/15 bg-primary/[0.03] p-4 shadow-sm transition-colors hover:border-primary/30 motion-reduce:transition-none sm:p-5">
      {!isRotationDisabled && (
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          data-testid="home-hint-progress"
          className="absolute right-4 top-4 h-5 w-5 -rotate-90 text-primary sm:right-5 sm:top-5"
        >
          <circle
            cx="10"
            cy="10"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="2"
            className="stroke-primary/20"
          />
          <circle
            ref={arcRef}
            cx="10"
            cy="10"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-primary"
            strokeDasharray={RING_CIRCUMFERENCE}
          />
        </svg>
      )}
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
        <AqLightbulb02 className="h-4 w-4" />
        Try this in Nexus
      </div>
      <p
        data-testid="home-hint"
        aria-live="polite"
        className={`relative mb-0 text-base font-medium text-foreground transition-opacity duration-300 motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(hint.href)}
          className="group inline-flex items-center gap-2 rounded-sm text-left underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {hint.text}
          <AqArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
        </button>
      </p>
    </div>
  );
};
