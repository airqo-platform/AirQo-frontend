import React from 'react';

/**
 * Skeleton loader for individual forum event detail pages
 * Matches the design of forum event detail pages with hero, content sections, and navigation
 */
const ForumDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative">
        <div className="relative z-10 py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Title skeleton */}
            <div className="h-16 bg-gray-300 rounded-lg w-full max-w-3xl mx-auto mb-6"></div>

            {/* Subtitle skeleton */}
            <div className="space-y-3 mb-8">
              <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>

            {/* Event meta info skeleton */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                <div className="h-5 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                <div className="h-5 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                <div className="h-5 bg-gray-300 rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Skeleton */}
      <div className="py-4">
        <div className="max-w-5xl mx-auto px-6 lg:px-0">
          <div className="flex space-x-8 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-8 bg-gray-300 rounded w-20 my-2 flex-shrink-0"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-5xl mx-auto px-6 lg:px-0 py-12">
        <div className="space-y-8">
          {/* Section title */}
          <div className="h-8 bg-gray-300 rounded-lg w-64"></div>

          {/* Content blocks */}
          <div className="space-y-6">
            {[1, 2, 3].map((block) => (
              <div key={block} className="space-y-4">
                {/* Paragraph skeleton */}
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>

                {/* Optional image skeleton */}
                {block === 2 && (
                  <div className="h-48 bg-gray-300 rounded-lg w-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumDetailSkeleton;
