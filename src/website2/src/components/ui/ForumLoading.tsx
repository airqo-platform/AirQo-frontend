'use client';

import React from 'react';

import mainConfig from '@/configs/mainConfigs';
import { cn } from '@/lib/utils';

interface ForumLoadingProps {
  className?: string;
  message?: string;
}

const ForumLoading: React.FC<ForumLoadingProps> = ({
  className,
  message = 'Loading Clean Air Forum…',
}) => {
  return (
    <div className={cn('min-h-screen w-full', className)}>
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className={`${mainConfig.containerClass} px-4 lg:px-0`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-12 bg-white/20 rounded-lg w-3/4 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded-lg w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className={`${mainConfig.containerClass} px-4 lg:px-0 py-16`}>
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-300 rounded-lg w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded-lg w-1/2 mx-auto animate-pulse"></div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded w-20 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded-lg w-full mt-6"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Message */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </section>
    </div>
  );
};

export default ForumLoading;
