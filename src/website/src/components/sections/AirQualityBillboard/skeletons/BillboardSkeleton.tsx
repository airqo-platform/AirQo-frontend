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
              ? 'flex-1 grid grid-cols-[minmax(0,1fr)_minmax(130px,180px)] sm:grid-cols-[minmax(0,1fr)_minmax(160px,230px)] lg:grid-cols-[minmax(0,1fr)_minmax(200px,280px)] gap-4 sm:gap-6 lg:gap-8 min-h-0'
              : 'flex-1 grid grid-cols-1 xl:grid-cols-[1.2fr_minmax(220px,320px)] gap-4 sm:gap-6 lg:gap-8 min-h-0'
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

            {/* 7-Day Forecast */}
            <div className="mt-2 sm:mt-3">
              <div
                className={
                  homepage
                    ? 'flex md:grid md:grid-cols-7 gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0 pr-1 md:pr-0'
                    : 'grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4'
                }
              >
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center rounded-lg bg-blue-600/25 animate-pulse ${
                      homepage
                        ? 'p-2 sm:p-3 min-w-[92px] sm:min-w-[102px] md:min-w-0 min-h-[104px] sm:min-h-[116px] md:min-h-[126px]'
                        : 'p-2.5 sm:p-3 lg:p-3.5 min-h-[112px] sm:min-h-[124px] lg:min-h-[132px]'
                    }`}
                  >
                    <div className="h-4 w-6 bg-white/30 rounded mb-2" />
                    <div className="h-4 w-10 bg-white/30 rounded mb-2" />
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/30 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div
            className={
              homepage
                ? 'flex flex-col items-end justify-start gap-[clamp(0.75rem,1.5vw,1.25rem)] min-h-[180px] md:min-h-[220px] w-full'
                : 'flex flex-col items-center xl:items-end justify-between min-h-0 gap-[clamp(0.75rem,1.5vw,1.25rem)]'
            }
          >
            {/* Air Quality Icon Skeleton */}
            <div className="flex items-center justify-center lg:justify-end w-full">
              <div
                className="bg-white/20 rounded-full animate-pulse"
                style={{
                  width: homepage
                    ? 'clamp(5rem, 8vw, 8rem)'
                    : 'clamp(6.5rem, 11vw, 11rem)',
                  height: homepage
                    ? 'clamp(5rem, 8vw, 8rem)'
                    : 'clamp(6.5rem, 11vw, 11rem)',
                }}
              />
            </div>

            {/* QR Code Skeleton */}
            <div className="flex flex-col items-center gap-[clamp(0.25rem,0.6vw,0.5rem)] mt-auto">
              <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
              <div
                className="bg-white rounded-lg animate-pulse shadow-xl ring-2 ring-white/40"
                style={{
                  width: 'clamp(4.75rem, 8vw, 8rem)',
                  height: 'clamp(4.75rem, 8vw, 8rem)',
                }}
              />
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
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-white/20 rounded-full animate-pulse flex-shrink-0" />
            <div className="h-5 sm:h-6 lg:h-7 xl:h-8 flex-1 bg-white/20 rounded animate-pulse" />
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
