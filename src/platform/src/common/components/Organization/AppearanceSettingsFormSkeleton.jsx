import React from 'react';

const AppearanceSettingsFormSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded mr-2"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>

      {/* Theme selection skeleton */}
      <div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview skeleton */}
      <div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-100 dark:bg-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-1/2"></div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color picker skeleton */}
      <div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-4"></div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettingsFormSkeleton;
