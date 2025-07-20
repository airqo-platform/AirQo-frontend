import React from 'react';
import CardWrapper from '@/common/components/CardWrapper';

/**
 * Skeleton loader component for the Members page
 * Provides a loading state that matches the exact structure of the actual Members page
 *
 * @param {number} rowCount - Number of skeleton rows to display (default: 5)
 * @returns {JSX.Element} Skeleton loader matching the Members page layout
 */
const MembersPageSkeleton = ({ rowCount = 5 }) => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-80 mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
      </div>

      {/* Members Table Skeleton */}
      <CardWrapper padding="p-0" className="overflow-hidden">
        {/* Table Header with Members Count */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {/* Table Headers */}
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </th>
              </tr>
            </thead>
            {/* Table Body with Member Rows */}
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(rowCount)].map((_, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {/* Member Column - Avatar + Name + Login Count */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      </div>
                      <div className="ml-4 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  {/* Contact Column - Email + Description */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    </div>
                  </td>
                  {/* Status Column - Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
                  </td>
                  {/* Last Active Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  </td>
                  {/* Actions Column - Ellipsis Button */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded ml-auto animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardWrapper>
    </div>
  );
};

export default MembersPageSkeleton;
