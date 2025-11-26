import React from 'react';

const DomainSettingsFormSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg mr-3 bg-gray-200 dark:bg-gray-700">
            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div>
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* Current URL Display Skeleton */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* URL Customization Skeleton */}
      <div className="space-y-4 mb-6">
        <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>

        {/* URL Input Field Skeleton */}
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-r border-gray-300 dark:border-gray-600">
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="flex-1 px-4 py-3">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Preview Skeleton */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="h-4 w-20 bg-blue-300 dark:bg-blue-600 rounded mb-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 dark:bg-blue-500 rounded"></div>
            <div className="h-4 w-56 bg-blue-300 dark:bg-blue-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Guidelines Skeleton */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 rounded mt-0.5"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-yellow-400 dark:bg-yellow-600 rounded mb-2"></div>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-3 bg-yellow-300 dark:bg-yellow-700 rounded w-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-9 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export default DomainSettingsFormSkeleton;
