import React from 'react';

import { cn } from '@/lib/utils';

interface BillboardSkeletonProps {
  centered?: boolean;
}

const BillboardSkeleton: React.FC<BillboardSkeletonProps> = ({
  centered = false,
}) => {
  return (
    <div
      className={cn(
        'w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl text-white shadow-2xl relative overflow-hidden',
        centered ? 'h-full' : 'min-h-[500px]',
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 h-full flex flex-col p-4 sm:p-6 lg:p-10 gap-4 sm:gap-5 lg:gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Last Updated */}
          <div className="h-3.5 sm:h-4 w-32 sm:w-40 bg-white/20 rounded animate-pulse" />

          {/* Dropdown Selector */}
          <div className="w-full sm:w-auto sm:min-w-[240px] lg:min-w-[280px]">
            <div className="h-9 sm:h-10 w-full bg-white/10 border border-white/30 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Main Content - Using CSS Grid for responsive layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 sm:gap-6 lg:gap-8 min-h-0">
          {/* Left Section */}
          <div className="flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5">
            {/* Air Quality Title */}
            <div className="h-8 sm:h-10 lg:h-12 xl:h-14 w-48 sm:w-56 lg:w-64 bg-white/20 rounded animate-pulse" />

            {/* PM2.5 Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-white/20 rounded-full animate-pulse" />
              <div className="h-6 sm:h-7 lg:h-8 w-20 sm:w-24 bg-white/20 rounded animate-pulse" />
            </div>

            {/* Large PM2.5 Value */}
            <div className="flex items-baseline gap-2">
              <div className="h-16 sm:h-20 lg:h-24 xl:h-28 w-40 sm:w-48 lg:w-56 xl:w-64 bg-white/20 rounded animate-pulse" />
              <div className="h-7 sm:h-9 lg:h-10 w-16 sm:w-20 bg-white/20 rounded animate-pulse" />
            </div>

            {/* 7-Day Forecast */}
            <div className="mt-2 sm:mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px] bg-blue-500/30 animate-pulse"
                  >
                    <div className="h-3 sm:h-3.5 w-4 bg-white/30 rounded mb-1" />
                    <div className="h-2.5 sm:h-3 w-6 bg-white/30 rounded mb-1 sm:mb-2" />
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/30 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center lg:items-end justify-between space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Large Air Quality Icon */}
            <div className="flex justify-center lg:justify-end flex-1 items-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 bg-white/20 rounded-full animate-pulse" />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center lg:items-end gap-1.5 sm:gap-2">
              <div className="h-3 sm:h-3.5 w-16 sm:w-20 bg-white/20 rounded animate-pulse" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 lg:pt-5 border-t border-white/20">
          {/* Air Quality Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="h-6 sm:h-7 lg:h-8 w-24 sm:w-28 bg-white/30 rounded-full animate-pulse" />
            <div className="h-4 sm:h-5 lg:h-6 w-40 sm:w-48 bg-white/20 rounded animate-pulse" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/20 rounded-full animate-pulse" />
            <div className="h-5 sm:h-6 lg:h-7 xl:h-8 w-48 sm:w-56 lg:w-64 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillboardSkeleton;
