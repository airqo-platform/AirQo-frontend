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
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible = true,
  className = '',
  opacity = 0.2,
  delayMs = 120,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible && delayMs === 0);

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
      <div className="SecondaryMainloader" aria-label="Loading"></div>
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

// ============================================================================
// Exports
// ============================================================================

export { LoadingOverlay };
export type { LoadingOverlayProps };
