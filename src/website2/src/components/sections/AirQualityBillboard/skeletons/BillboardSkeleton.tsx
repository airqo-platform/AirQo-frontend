import React from 'react';

interface BillboardSkeletonProps {
  centered?: boolean;
  homepage?: boolean;
}

const BillboardSkeleton: React.FC<BillboardSkeletonProps> = ({
  centered = false,
  homepage = false,
}) => {
  const content = (
    <div className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl text-white shadow-2xl relative overflow-hidden h-full">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div
        className={
          'relative z-10 h-full flex flex-col p-3 sm:p-4 lg:p-6 gap-4 sm:gap-5 lg:gap-6'
        }
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {centered ? (
            /* Timestamp for centered mode */
            <div className="h-4 sm:h-5 w-44 sm:w-52 bg-white/20 rounded animate-pulse" />
          ) : (
            <>
              {/* Last Updated */}
              <div className="h-3.5 sm:h-4 w-32 sm:w-40 bg-white/20 rounded animate-pulse" />

              {/* Dropdown Selector */}
              <div className="w-full sm:w-auto sm:min-w-[240px] lg:min-w-[280px]">
                <div className="h-9 sm:h-10 w-full bg-white/10 border border-white/30 rounded-lg animate-pulse" />
              </div>
            </>
          )}
        </div>

        {/* Main Content - Using CSS Grid for responsive layout */}
        <div
          className={
            homepage
              ? 'flex-1 grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 min-h-0'
              : 'flex-1 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 sm:gap-6 lg:gap-8 min-h-0'
          }
        >
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

            {/* 7-Day Forecast - show on non-homepage everywhere, and on homepage only from md+ */}
            {homepage ? (
              <div className="mt-2 sm:mt-3 hidden md:block">
                <div className="flex items-center gap-2 flex-wrap">
                  {[...Array(7)].map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center rounded-lg p-1 sm:p-2 min-w-[48px] sm:min-w-[56px] bg-blue-500/30 animate-pulse"
                    >
                      <div className="h-3 sm:h-3.5 w-4 bg-white/30 rounded mb-1" />
                      <div className="h-2.5 sm:h-3 w-6 bg-white/30 rounded mb-1 sm:mb-2" />
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/30 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2 sm:mt-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {[...Array(7)].map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center rounded-lg p-3 sm:p-4 lg:p-5 min-w-[110px] sm:min-w-[120px] bg-blue-600/25 animate-pulse"
                    >
                      <div className="h-4 sm:h-5 w-6 sm:w-8 bg-white/30 rounded mb-2" />
                      <div className="h-3 sm:h-4 w-10 sm:w-12 bg-white/30 rounded mb-2" />
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 bg-white/30 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div
            className={
              homepage
                ? 'flex flex-col items-end justify-between space-y-3 sm:space-y-4 lg:space-y-6 w-full'
                : 'flex flex-col items-center lg:items-end justify-between space-y-3 sm:space-y-4 lg:space-y-6'
            }
          >
            <div
              className={
                homepage
                  ? 'w-full flex items-center justify-end pr-2'
                  : 'flex justify-center lg:justify-end flex-1 items-center'
              }
            >
              {homepage ? (
                <div className="w-full flex items-center justify-end">
                  <div className="h-16 sm:h-20 lg:h-24 xl:h-28 w-full bg-white/20 rounded animate-pulse" />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white/20 rounded-full animate-pulse ml-3" />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 bg-white/20 rounded-full animate-pulse" />
              )}
            </div>

            <div
              className={
                homepage
                  ? 'w-full hidden md:flex items-center justify-end pr-2'
                  : 'w-full flex items-center justify-end gap-4 pr-2'
              }
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 bg-white/20 rounded-full animate-pulse" />
            </div>

            <div className="w-full flex md:hidden flex-col items-end">
              <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 bg-white/20 rounded-full animate-pulse" />
              {!homepage && (
                <div className="flex flex-col items-end gap-1 sm:gap-2 mt-3">
                  <div className="h-3 sm:h-3.5 w-16 sm:w-20 bg-white/20 rounded animate-pulse" />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-lg animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Absolute QR skeleton - positioned above divider on the right */}
        <div className="hidden md:flex absolute right-6 bottom-20 lg:bottom-24 items-center flex-col gap-1 sm:gap-2 pointer-events-none">
          <div className="h-3 sm:h-3.5 w-16 sm:w-20 bg-white/20 rounded animate-pulse" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-lg animate-pulse" />
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

  if (centered) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center overflow-hidden p-1 sm:p-2"
        style={{
          height: '100dvh', // Dynamic viewport height for mobile browsers
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default BillboardSkeleton;
