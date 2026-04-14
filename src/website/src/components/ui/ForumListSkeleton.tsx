import React from 'react';

/**
 * Skeleton loader for the forum events listing page
 * Matches the design of the main forum events list with hero section and cards
 */
const ForumListSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full animate-pulse">
      {/* Events List Section Skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Section heading skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded-lg w-80 max-w-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-96 max-w-full mx-auto"></div>
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Image skeleton */}
              <div className="h-48 bg-gray-200"></div>

              {/* Card content */}
              <div className="p-6">
                {/* Status badge skeleton */}
                <div className="h-6 bg-gray-200 rounded-full w-20 mb-4"></div>

                {/* Title skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>

                {/* Description skeleton */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>

                {/* Date and location skeleton */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button skeleton */}
        <div className="flex justify-center mt-12">
          <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default ForumListSkeleton;
