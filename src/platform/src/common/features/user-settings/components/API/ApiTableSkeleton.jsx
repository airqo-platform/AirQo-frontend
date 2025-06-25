import React from 'react';

const ApiTableSkeleton = ({ rows = 4 }) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, index) => (
        <tr
          key={index}
          className="border-b border-gray-200 dark:border-gray-700"
        >
          {/* Client name */}
          <td className="w-[200px] px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
          {/* IP Address */}
          <td className="w-[138px] px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
          {/* Status */}
          <td className="w-[142px] px-4 py-3">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto"></div>
          </td>
          {/* Created */}
          <td className="w-[138px] px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
          {/* Token */}
          <td className="w-[138px] px-4 py-3">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          </td>
          {/* Expires */}
          <td className="w-[138px] px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
          {/* Actions */}
          <td className="w-24 px-4 py-3">
            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default ApiTableSkeleton;
