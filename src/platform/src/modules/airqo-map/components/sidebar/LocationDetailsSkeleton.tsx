'use client';

import * as React from 'react';

export const LocationDetailsSkeleton: React.FC = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="flex-shrink-0 p-4 pb-2 border-b">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
      {/* Weekly Forecast Card Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
        </div>
      </div>

      {/* Current Air Quality Card Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {/* Header with PM2.5 value and icon */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Location and Air Quality sections */}
        <div className="space-y-4">
          <div className="pb-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>

          <div className="pb-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>

          {/* Show more button */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
        </div>
      </div>

      {/* Health Alerts Card Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      {/* More Insights Card Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
          </div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
