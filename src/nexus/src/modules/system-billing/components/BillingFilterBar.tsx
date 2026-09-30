'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface BillingFilterField {
  /** Rendered above the control. Omit when the control brings its own label. */
  label?: string;
  children: React.ReactNode;
  /** Width hint, e.g. 'lg:w-64' for a search box. */
  className?: string;
}

interface BillingFilterBarProps {
  /** Primary controls (search, method, date range). */
  fields?: BillingFilterField[];
  /** Segmented filter groups, e.g. Status / Type. */
  groups?: React.ReactNode;
  className?: string;
}

/**
 * Card surface for a list page's filter controls.
 *
 * Previously each list page composed its own rows of floating controls, which
 * left the filters visually unanchored and mixed stacked labels (Select,
 * date range) with inline ones (segmented controls). This puts them in one
 * surface with a consistent label style, a rule between the input row and the
 * filter groups, and a responsive grid that never overflows on small screens.
 */
const BillingFilterBar: React.FC<BillingFilterBarProps> = ({
  fields = [],
  groups,
  className,
}) => {
  if (fields.length === 0 && !groups) return null;

  const hasFields = fields.length > 0;

  return (
    <Card className={cn('border border-border/70 p-4', className)}>
      <div className="flex flex-col gap-4">
        {hasFields && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(field => (
              <div
                key={field.label}
                className={cn(
                  'flex min-w-0 flex-col gap-1.5',
                  field.className ?? 'sm:col-span-2 lg:col-span-1'
                )}
              >
                {field.label && (
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </span>
                )}
                {field.children}
              </div>
            ))}
          </div>
        )}

        {groups && (
          <div
            className={cn(
              'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8',
              hasFields && 'border-t border-border/60 pt-4'
            )}
          >
            {groups}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BillingFilterBar;
