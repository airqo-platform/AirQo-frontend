import React from 'react';

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
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible = true,
  className = '',
  opacity = 0.5,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-white flex items-center justify-center z-50 ${className}`}
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity})` }}
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
