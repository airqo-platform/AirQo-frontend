import React from 'react';

const OrganizationSettingsSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              {/* Section Title */}
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>

              {/* Logo Upload Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Description Field Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Select Fields Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Timezone Field Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              {/* Actions Header */}
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>

              {/* Save Button Skeleton */}
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>

              {/* Organization Stats Skeleton */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Pro Tips Skeleton */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                <div className="h-4 w-20 bg-blue-200 dark:bg-blue-700 rounded"></div>
                <div className="space-y-1">
                  <div className="h-3 w-full bg-blue-100 dark:bg-blue-800 rounded"></div>
                  <div className="h-3 w-3/4 bg-blue-100 dark:bg-blue-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-blue-100 dark:bg-blue-800 rounded"></div>
                  <div className="h-3 w-4/5 bg-blue-100 dark:bg-blue-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsSkeleton;
