import React from 'react';

const AirQualityLoadingSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-1/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-10 w-28 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded" />
        <div className="h-10 w-28 bg-gray-200 rounded" />
        <div className="flex-1" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="space-y-4 p-4 bg-white rounded shadow">
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-10 w-1/2 bg-gray-200 rounded-full" />
          <div className="h-8 w-1/3 bg-gray-200 rounded-full" />
        </div>
        {/* Card 2 */}
        <div className="space-y-4 p-4 bg-white rounded shadow">
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-10 w-1/2 bg-gray-200 rounded-full" />
          <div className="h-8 w-1/3 bg-gray-200 rounded-full" />
        </div>
        {/* Add Location Card */}
        <div className="flex items-center justify-center p-4 bg-white rounded border-2 border-dashed border-gray-200">
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="space-y-4 p-4 bg-white rounded shadow">
          <div className="h-5 w-1/3 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
        {/* Distribution Chart */}
        <div className="space-y-4 p-4 bg-white rounded shadow">
          <div className="h-5 w-1/3 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default AirQualityLoadingSkeleton;
