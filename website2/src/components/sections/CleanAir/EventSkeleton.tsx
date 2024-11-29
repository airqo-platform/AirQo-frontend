import React from 'react';

const EventSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-lg p-4 shadow-md animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full lg:w-1/4">
        <div className="h-44 bg-gray-300 rounded-lg"></div>
      </div>

      {/* Content Skeleton */}
      <div className="w-full lg:w-3/4 flex flex-col justify-between">
        {/* Title and Details */}
        <div className="flex flex-col gap-4">
          <div className="h-6 bg-gray-300 rounded-md w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded-md w-1/3"></div>
        </div>

        {/* Date and Read More Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-300 rounded-md w-1/3"></div>
          <div className="h-8 bg-gray-300 rounded-md w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default EventSkeleton;
