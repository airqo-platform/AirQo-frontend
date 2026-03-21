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
  <div className={cn('animate-pulse rounded-md bg-muted', className)} />
);

export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  isCollapsed = false,
  showBrand = false,
  className,
}) => {
  const itemCount = 4;

  return (
    <Card
      className={cn('flex-1 border-0 shadow-none bg-transparent', className)}
    >
      <CardContent className="p-4 md:p-5">
        {showBrand && !isCollapsed && (
          <div className="mb-4 flex items-center gap-3">
            <SkeletonBlock className="h-9 w-9 rounded-full" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        )}

        {isCollapsed ? (
          <div className="space-y-3 pt-2">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div
                key={`collapsed-item-${index}`}
                className="flex justify-center"
              >
                <SkeletonBlock className="h-10 w-10 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div
                key={`item-${index}`}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
              >
                <SkeletonBlock className="h-9 w-9 rounded-lg" />
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
