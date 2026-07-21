'use client';

import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// LoadingOverlay Component
// ============================================================================

const FADE_OUT_MS = 300;

interface LoadingOverlayProps {
  /**
   * Whether the overlay is visible
   */
  isVisible?: boolean;
  /**
   * Additional CSS classes for the overlay
   */
  className?: string;
  /**
   * Delay (ms) before showing to reduce flicker on fast transitions
   */
  delayMs?: number;
  /**
   * Optional heading displayed below the loader
   */
  title?: string;
  /**
   * Optional supporting text displayed below the title
   */
  description?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible = true,
  className = '',
  delayMs = 120,
  title,
  description,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible && delayMs === 0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const hasCopy = Boolean(title || description);

  useEffect(() => {
    if (isVisible) {
      setIsFadingOut(false);
      if (delayMs === 0) {
        setShouldRender(true);
        return;
      }
      const timeoutId = window.setTimeout(() => {
        setShouldRender(true);
      }, delayMs);
      return () => window.clearTimeout(timeoutId);
    }

    if (!shouldRender) return;

    setIsFadingOut(true);
    hideTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      setIsFadingOut(false);
    }, FADE_OUT_MS);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [delayMs, isVisible, shouldRender]);

  if (!shouldRender && !isFadingOut) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-background/80 transition-opacity duration-300 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`}
      role="status"
      aria-live="polite"
    >
      {hasCopy ? (
        <div className={`flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/85 px-8 py-6 text-center shadow-sm transition-opacity duration-300 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <div
            className="SecondaryMainloader"
            aria-label={title || 'Loading'}
          ></div>
          <div className="max-w-sm space-y-1">
            {title ? (
              <p className="text-sm font-semibold text-foreground">{title}</p>
            ) : null}
            {description ? (
              <p className="text-xs leading-5 text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="SecondaryMainloader" aria-label="Loading"></div>
      )}
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

// ============================================================================
// Exports
// ============================================================================

export { LoadingOverlay };
export type { LoadingOverlayProps };
