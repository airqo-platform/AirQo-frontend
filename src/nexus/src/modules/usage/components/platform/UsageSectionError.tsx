'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';

export interface UsageSectionErrorProps {
  /** Section-specific banner title, e.g. "Failed to load retention". */
  title: React.ReactNode;
  /** Banner message — callers pass the error text plus any section fallback. */
  message: React.ReactNode;
  onRetry: () => void;
  /**
   * Retry button label. Sections use the default "Retry"; the stale-data
   * banner on the platform page uses "Refresh".
   */
  actionLabel?: string;
  /**
   * Page-level blocking errors render the banner and the retry button as
   * siblings inside a `space-y-4` column (the banner has no actions row).
   * Section boundaries use the default inline banner-actions row.
   */
  stacked?: boolean;
}

/**
 * Shared platform-Usage error boundary: an `ErrorBanner` plus the standard
 * underlined text-button retry action, with the same Button semantics
 * (`variant="text" size="sm" type="button"`) every section used before.
 * Section-specific titles/messages stay with the caller so user-facing copy
 * is unchanged.
 */
export const UsageSectionError: React.FC<UsageSectionErrorProps> = ({
  title,
  message,
  onRetry,
  actionLabel = 'Retry',
  stacked = false,
}) => {
  const retryButton = (
    <Button
      variant="text"
      size="sm"
      type="button"
      onClick={onRetry}
      className="underline"
    >
      {actionLabel}
    </Button>
  );

  if (stacked) {
    return (
      <div className="space-y-4">
        <ErrorBanner title={title} message={message} />
        {retryButton}
      </div>
    );
  }

  return <ErrorBanner title={title} message={message} actions={retryButton} />;
};

export default UsageSectionError;
