'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn('animate-pulse rounded bg-muted', className)}
    aria-hidden="true"
  />
);

/**
 * In-place skeleton for the report body (metric cards + chart blocks) — the
 * same layout the loaded report renders, so resolving the cohort selection
 * or loading the report never flashes white or shifts layout.
 */
export const OrgReportBodySkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn('w-full space-y-5', className)}
    aria-busy="true"
    aria-label="Loading organization report"
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map(index => (
        <SkeletonBlock key={index} className="h-32 w-full rounded-md" />
      ))}
    </div>
    <SkeletonBlock className="h-[380px] w-full rounded-md" />
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SkeletonBlock className="h-[380px] w-full rounded-md" />
      <SkeletonBlock className="h-[380px] w-full rounded-md" />
    </div>
  </div>
);

export const OrgDashboardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn('w-full space-y-5', className)}
    aria-busy="true"
    aria-label="Loading organization dashboard"
  >
    {/* Header lines */}
    <div className="space-y-2">
      <SkeletonBlock className="h-7 w-64" />
      <SkeletonBlock className="h-4 w-96 max-w-full" />
    </div>
    {/* Filter card */}
    <SkeletonBlock className="h-28 w-full rounded-md" />
    {/* Report body: metric cards + charts */}
    <OrgReportBodySkeleton />
  </div>
);
