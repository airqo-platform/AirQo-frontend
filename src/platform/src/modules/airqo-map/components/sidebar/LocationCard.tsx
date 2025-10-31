'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { AqMarkerPin02 } from '@airqo/icons-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tooltip } from 'flowbite-react';

interface LocationCardProps {
  title: string;
  location: string;
  onClick?: () => void;
  className?: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  title,
  location,
  onClick,
  className,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer hover:bg-primary/10  dark:bg-gray-700 dark:hover:bg-primary/20 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-200 border border-primary/20 dark:border-primary/30 shadow-sm rounded-lg',
        className
      )}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0 max-w-[180px] sm:max-w-[200px] md:max-w-[220px]">
          <Tooltip
            content={title}
            placement="top"
            style="dark"
            className="bg-black text-white rounded-md px-2 py-1 text-xs max-w-xs"
          >
            <h3
              className="text-sm font-medium text-foreground truncate cursor-pointer"
              title={title}
            >
              {title}
            </h3>
          </Tooltip>
          <Tooltip
            content={location}
            placement="top"
            style="dark"
            className="bg-black text-white rounded-md px-2 py-1 text-xs max-w-xs"
          >
            <p
              className="text-xs text-muted-foreground mb-0 truncate cursor-pointer"
              title={location}
            >
              {location}
            </p>
          </Tooltip>
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1.5 transition-colors duration-200">
            <AqMarkerPin02 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors duration-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface LocationCardSkeletonProps {
  className?: string;
}

export const LocationCardSkeleton: React.FC<LocationCardSkeletonProps> = ({
  className,
}) => {
  return (
    <Card
      className={cn(
        'border border-primary/20  shadow-sm rounded-lg animate-pulse',
        className
      )}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0 max-w-[180px] sm:max-w-[200px] md:max-w-[220px]">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className="bg-gray-200 rounded-full p-1.5">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
