'use client';

import React, { useEffect, useState } from 'react';
import { AqArrowRight, AqLightbulb02 } from '@airqo/icons-react';
import { HOME_HINTS } from '../constants';

export const RotatingHint = ({
  onSelect,
}: {
  onSelect: (href: string) => void;
}) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media || media.matches) return;

    let fadeTimer = 0;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        setIndex(current => (current + 1) % HOME_HINTS.length);
        setVisible(true);
      }, 220);
    }, 5600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
    };
  }, []);

  const hint = HOME_HINTS[index];

  return (
    <div className="relative flex h-full min-h-28 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <AqLightbulb02 className="h-4 w-4" />
        Try this in Nexus
      </div>
      <p
        data-testid="home-hint"
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
          <AqArrowRight className="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
        </button>
      </p>
    </div>
  );
};
