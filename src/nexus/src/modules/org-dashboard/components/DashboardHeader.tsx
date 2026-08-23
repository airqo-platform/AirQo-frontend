'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface DashboardHeaderProps {
  organizationTitle: string;
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

/**
 * Organization dashboard header — title and an empty-state placeholder
 * waiting for a backend overview API.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  organizationTitle,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <h1 className="truncate text-2xl text-foreground">
        {formatOrgName(organizationTitle)}
      </h1>
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            Overview coming soon — insights for this organization will appear
            here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
