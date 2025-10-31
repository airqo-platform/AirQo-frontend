'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';

interface MapSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  children,
  className,
}) => {
  return (
    <Card
      className={cn(
        'flex flex-col h-full md:max-w-[340px] rounded-none md:rounded-lg overflow-hidden',
        className
      )}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
    </Card>
  );
};
