'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import SelectField from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { usePostHog } from 'posthog-js/react';
import { capturePostHogEvent } from '@/shared/utils/analytics';
import { ANALYTICS_EVENTS } from '@/shared/utils/analyticsConstants';
import type { OrgCohortOption } from '@/shared/hooks/useOrgCohorts';

export interface OrgCohortSelectorProps {
  /** Pre-resolved cohort options (ids + display names). */
  cohorts: OrgCohortOption[];
  /** Selected cohort id (controlled). */
  value: string;
  /** Called with the selected cohort id on every change. */
  onChange: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
  /** Visual density forwarded to the underlying SelectField trigger. */
  size?: 'default' | 'control';
  /** Optional heading rendered above the cohort list inside the dropdown. */
  listHeader?: React.ReactNode;
  /** Identifies where this shared selector is rendered in product analytics. */
  source?: 'organization_header' | 'data_export' | 'other';
}

/**
 * Presentational, controlled org-flow cohort selector. It renders exactly the
 * cohort options it is given — no fetching, no persistence, no "All cohorts".
 * Selection state and data live in the org-wide cohort context; this component
 * only reflects `value` and reports changes through `onChange`.
 */
export const OrgCohortSelector: React.FC<OrgCohortSelectorProps> = ({
  cohorts,
  value,
  onChange,
  isLoading = false,
  error = null,
  onRetry,
  placeholder = 'Select a cohort',
  disabled = false,
  ariaLabel,
  className,
  containerClassName,
  size = 'default',
  listHeader,
  source = 'other',
}) => {
  const posthog = usePostHog();
  const cohortIds = cohorts.map(cohort => cohort.id);
  const isDisabled = disabled || isLoading || cohortIds.length === 0;
  const showError = !!error;
  const showRetry = showError && !!onRetry;
  const trackSelectorOpenChange = (isOpen: boolean) => {
    if (!isOpen) return;

    capturePostHogEvent(posthog, ANALYTICS_EVENTS.ORG_COHORT_SELECTOR_OPENED, {
      selector_source: source,
      cohort_count: cohorts.length,
      has_selected_cohort: Boolean(value),
      selected_cohort_position: cohorts.findIndex(
        cohort => cohort.id === value
      ),
    });
  };

  const handleChange = (nextValue: string) => {
    if (nextValue === value) return;

    capturePostHogEvent(posthog, ANALYTICS_EVENTS.ORG_COHORT_SELECTED, {
      selector_source: source,
      cohort_count: cohorts.length,
      previous_cohort_position: cohorts.findIndex(
        cohort => cohort.id === value
      ),
      selected_cohort_position: cohorts.findIndex(
        cohort => cohort.id === nextValue
      ),
    });
    onChange(nextValue);
  };

  return (
    <div className={cn('flex w-full items-start gap-2', containerClassName)}>
      <SelectField
        value={value}
        onChange={event => {
          const nextValue = event.target.value;
          if (typeof nextValue === 'string') {
            handleChange(nextValue);
          }
        }}
        onOpenChange={trackSelectorOpenChange}
        disabled={isDisabled}
        placeholder={placeholder}
        error={error ?? undefined}
        size={size}
        listHeader={listHeader}
        containerClassName="mb-0 min-w-0 flex-1"
        className={className}
        aria-label={ariaLabel}
      >
        {cohorts.map((cohort, index) => (
          <option key={cohort.id} value={cohort.id}>
            {cohort.name || `Cohort ${index + 1}`}
          </option>
        ))}
      </SelectField>
      {showRetry && (
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={onRetry}
          className="shrink-0"
          aria-label="Retry loading cohorts"
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export default OrgCohortSelector;
