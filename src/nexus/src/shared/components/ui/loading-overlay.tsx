'use client';

import React, { useEffect, useState } from 'react';

// ============================================================================
// LoadingOverlay Component
// ============================================================================

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
   * Background opacity (0-1)
   */
  opacity?: number;
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
  opacity = 0.2,
  delayMs = 120,
  title,
  description,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible && delayMs === 0);
  const hasCopy = Boolean(title || description);

  useEffect(() => {
    if (!isVisible) {
      setShouldRender(false);
      return;
    }

    if (delayMs === 0) {
      setShouldRender(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRender(true);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity ${className}`}
      style={{ backgroundColor: `rgba(248, 250, 252, ${opacity})` }}
      role="status"
      aria-live="polite"
    >
      {hasCopy ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/85 px-8 py-6 text-center shadow-sm">
          <div
            className="SecondaryMainloader"
            aria-label={title || 'Loading'}
          ></div>
          <div className="max-w-sm space-y-1">
            {title ? (
              <p className="text-sm font-semibold text-slate-900">{title}</p>
            ) : null}
            {description ? (
              <p className="text-xs leading-5 text-slate-600">{description}</p>
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
