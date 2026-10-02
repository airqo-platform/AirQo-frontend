'use client';

import * as React from 'react';
import { useOrgCohortContext } from '@/shared/providers/org-cohort-provider';
import { OrgCohortSelector } from './OrgCohortSelector';
import { Button } from '@/shared/components/ui/button';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { usePostHog } from 'posthog-js/react';
import { capturePostHogEvent } from '@/shared/utils/analytics';
import { ANALYTICS_EVENTS } from '@/shared/utils/analyticsConstants';

const NEW_BADGE_DISMISSED_KEY =
  'airqo.nexus.organization-cohort-selector-new-dismissed.v1';

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
  const posthog = usePostHog();
  const [showNewBadge, setShowNewBadge] = React.useState(false);

  React.useEffect(() => {
    try {
      setShowNewBadge(
        window.localStorage.getItem(NEW_BADGE_DISMISSED_KEY) !== 'true'
      );
    } catch {
      setShowNewBadge(true);
    }
  }, []);

  const dismissNewBadge = React.useCallback(() => {
    setShowNewBadge(false);
    try {
      window.localStorage.setItem(NEW_BADGE_DISMISSED_KEY, 'true');
    } catch {
      // Keep the badge dismissed for this page session when storage is blocked.
    }
  }, []);

  // Outside the org provider (user flow) — render nothing.
  if (!ctx) {
    return null;
  }

  const showRetry = !!ctx.error && ctx.cohorts.length === 0;

  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
      <div className="relative min-w-0">
        <OrgCohortSelector
          size="control"
          cohorts={ctx.cohorts}
          value={ctx.selectedCohortId}
          onChange={ctx.selectCohort}
          onOpen={dismissNewBadge}
          isLoading={ctx.isLoading}
          placeholder={ctx.isLoading ? 'Loading…' : 'Cohort'}
          ariaLabel="Organization cohort"
          listHeader="Select cohort"
          source="organization_header"
          className="min-w-0"
          containerClassName={cn('mb-0 min-w-0', containerClassName)}
        />
        {showNewBadge && !ctx.isLoading && ctx.cohorts.length > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-primary-foreground shadow-sm ring-2 ring-background"
          >
            NEW
          </span>
        )}
      </div>
      {showRetry && (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          aria-label="Retry loading cohorts"
          title={ctx.error ?? undefined}
          onClick={() => {
            capturePostHogEvent(
              posthog,
              ANALYTICS_EVENTS.ORG_COHORTS_RETRY_CLICKED,
              {
                selector_source: 'organization_header',
                cohort_count: ctx.cohorts.length,
              }
            );
            ctx.refetch();
          }}
        >
          <AqRefreshCcw01 className="text-foreground" />
        </Button>
      )}
    </div>
  );
};

export default OrgCohortSwitcher;
