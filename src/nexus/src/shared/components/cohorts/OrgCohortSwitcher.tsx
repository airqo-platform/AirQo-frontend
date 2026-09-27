'use client';

import * as React from 'react';
import { useOrgCohortContext } from '@/shared/providers/org-cohort-provider';
import { OrgCohortSelector } from './OrgCohortSelector';
import { Button } from '@/shared/components/ui/button';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';

export interface OrgCohortSwitcherProps {
  /** Extra classes for the root wrapper. */
  className?: string;
  /** Extra classes merged into the selector container. */
  containerClassName?: string;
}

/**
 * Compact cohort selector rendered inline in the Header top row,
 * immediately next to the organization selector (and, below `md`, inside the
 * secondary navigation bar). Consumes the org-wide cohort context; renders
 * nothing in the user flow (where the provider is absent) so it never leaks
 * into non-org pages.
 *
 * Always renders at `control` size so it visually matches the organization
 * selector (h-10, primary border, focus ring).
 *
 * No `error` prop is passed to the selector so header height stays stable —
 * a failed load with zero cohorts surfaces as a ghost retry button instead.
 */
export const OrgCohortSwitcher: React.FC<OrgCohortSwitcherProps> = ({
  className,
  containerClassName,
}) => {
  const ctx = useOrgCohortContext();

  // Outside the org provider (user flow) — render nothing.
  if (!ctx) {
    return null;
  }

  const showRetry = !!ctx.error && ctx.cohorts.length === 0;

  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
      <OrgCohortSelector
        size="control"
        cohorts={ctx.cohorts}
        value={ctx.selectedCohortId}
        onChange={ctx.selectCohort}
        isLoading={ctx.isLoading}
        placeholder={ctx.isLoading ? 'Loading…' : 'Cohort'}
        ariaLabel="Organization cohort"
        className="min-w-0"
        containerClassName={cn('mb-0 min-w-0', containerClassName)}
      />
      {showRetry && (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          aria-label="Retry loading cohorts"
          title={ctx.error ?? undefined}
          onClick={ctx.refetch}
        >
          <AqRefreshCcw01 className="text-foreground" />
        </Button>
      )}
    </div>
  );
};

export default OrgCohortSwitcher;
