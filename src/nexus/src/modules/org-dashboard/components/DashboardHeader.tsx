'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface DashboardHeaderProps {
  organizationTitle: string;
  description?: string;
  className?: string;
}

const formatOrgName = (name: string, maxLen = 30): string => {
  const cleaned = name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const titled = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return titled.length > maxLen ? `${titled.slice(0, maxLen - 1)}…` : titled;
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  organizationTitle,
  description = 'Cohort-level air quality trends and coverage for this organization.',
  className,
}) => (
  <div className={cn('space-y-1', className)}>
    <h1 className="truncate text-2xl text-foreground">
      {formatOrgName(organizationTitle)}
    </h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
