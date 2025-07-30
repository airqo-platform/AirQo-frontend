import React, { memo } from 'react';

export const SkeletonCard = memo(() => (
  <div className="w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl p-4 sm:p-5 h-auto min-h-[180px] shadow-sm animate-pulse">
    {/* Header Section */}
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col gap-1.5 flex-grow min-w-0">
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-8 w-8 flex-shrink-0 bg-gray-200 rounded-full"></div>
    </div>

    {/* Content Section */}
    <div className="flex justify-between items-center mt-auto pt-4">
      <div className="flex flex-col gap-2 text-left min-w-0">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 bg-gray-200 rounded-full ml-2"></div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';
export default SkeletonCard;
