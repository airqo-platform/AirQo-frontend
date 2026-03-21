'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';

interface SidebarSkeletonProps {
  isCollapsed?: boolean;
  showBrand?: boolean;
  className?: string;
}

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
      className
    )}
  />
);

export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  isCollapsed = false,
  showBrand = false,
  className,
}) => {
  const itemCount = 4;

  return (
    <Card
      className={cn('flex-1 border-0 bg-transparent shadow-none', className)}
    >
      <CardContent className="p-2 md:p-3">
        {showBrand && !isCollapsed && (
          <div className="mb-3 flex items-center gap-2">
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        )}

        {isCollapsed ? (
          <div className="space-y-2 pt-1">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div
                key={`collapsed-item-${index}`}
                className="flex justify-center"
              >
                <SkeletonBlock className="h-9 w-9 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pt-0.5">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div
                key={`item-${index}`}
                className="flex items-center gap-2 rounded-lg px-2 py-2"
              >
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-3.5 w-3/5" />
                  <SkeletonBlock className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
