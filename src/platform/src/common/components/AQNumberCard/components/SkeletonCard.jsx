import React from 'react';

export const SkeletonCard = React.memo(() => (
  <div className="w-full border border-gray-200 bg-white rounded-xl px-4 py-6">
    <div className="flex flex-col justify-between h-[168px]">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded-xl animate-pulse ml-2" />
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded-md w-24 animate-pulse" />
        </div>
        <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;
