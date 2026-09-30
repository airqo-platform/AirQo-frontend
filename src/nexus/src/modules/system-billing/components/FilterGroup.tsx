'use client';

import React from 'react';

interface FilterGroupProps {
  /** Short label that names what the control filters, e.g. "Status". */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a filter control with a visible label. Two unlabelled segmented controls
 * sitting next to each other read as one long strip of buttons, so the label
 * makes it obvious what each one changes. The row scrolls horizontally on
 * narrow screens instead of wrapping into an ambiguous block.
 */
const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  children,
  className = '',
}) => (
  <div
    className={`flex min-w-0 flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-3 ${className}`}
  >
    <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <div className="-mx-1 min-w-0 max-w-full overflow-x-auto px-1">
      {children}
    </div>
  </div>
);

export default FilterGroup;
