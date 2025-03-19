import React, { memo } from 'react';

export const SkeletonCard = memo(() => (
  <div className="w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-6 py-5 h-[220px] shadow-sm animate-pulse">
    {/* Header Section */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex flex-col flex-1 gap-1.5">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-7 w-16 bg-gray-200 rounded-xl"></div>
    </div>

    {/* Content Section */}
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';
export default SkeletonCard;
