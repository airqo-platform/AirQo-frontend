import { memo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';

const SkeletonCard = memo(() => (
  <Card className="w-full">
    <CardContent className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-4">
          {/* Site name skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 animate-pulse"></div>
          {/* Location skeleton */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {/* Trend indicator skeleton */}
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Main value and icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {/* Value skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-1 animate-pulse"></div>
          {/* Pollutant info skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>

        {/* Air quality icon skeleton */}
        <div className="flex-shrink-0 ml-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    </CardContent>
  </Card>
));
SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;
