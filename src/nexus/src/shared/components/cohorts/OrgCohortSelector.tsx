'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import SelectField from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
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
}) => {
  const cohortIds = cohorts.map(cohort => cohort.id);
  const isDisabled = disabled || isLoading || cohortIds.length === 0;
  const showError = !!error;
  const showRetry = showError && !!onRetry;

  return (
    <div className={cn('flex w-full items-start gap-2', containerClassName)}>
      <SelectField
        value={value}
        onChange={event => {
          const nextValue = event.target.value;
          if (typeof nextValue === 'string') {
            onChange(nextValue);
          }
        }}
        disabled={isDisabled}
        placeholder={placeholder}
        error={error ?? undefined}
        size={size}
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
