import React from 'react';

interface BillboardSkeletonProps {
  centered?: boolean;
}

const BillboardSkeleton: React.FC<BillboardSkeletonProps> = ({
  centered = false,
}) => {
  const content = (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Section */}
        <div className="space-y-4">
          {/* PM2.5 Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-white/20 rounded animate-pulse" />
          </div>

          {/* Large PM2.5 Value */}
          <div className="space-y-3">
            <div className="h-24 sm:h-32 md:h-40 w-full max-w-md bg-white/20 rounded-lg animate-pulse" />
          </div>

          {/* 7-Day Forecast */}
          <div className="mt-8">
            <div className="flex items-center gap-2 flex-wrap">
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-lg p-3 min-w-[60px] sm:min-w-[70px] bg-blue-500/30 animate-pulse"
                >
                  <div className="h-4 w-6 bg-white/30 rounded mb-1" />
                  <div className="h-3 w-8 bg-white/30 rounded mb-2" />
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-start lg:items-end justify-between space-y-6 lg:space-y-8">
          {/* Large Air Quality Icon */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 bg-white/20 rounded-full animate-pulse" />
          </div>

          {/* QR Code */}
          <div className="w-full flex flex-col items-center lg:items-end gap-2">
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse mb-2" />
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 space-y-4 pt-6 mt-6 border-t border-white/20">
        {/* Air Quality Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 w-32 bg-white/30 rounded-full animate-pulse" />
          <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full animate-pulse" />
          <div className="h-5 w-40 bg-white/20 rounded animate-pulse" />
        </div>

        {/* Last Updated */}
        <div className="h-4 w-56 bg-white/20 rounded animate-pulse" />
      </div>
    </div>
  );

  if (centered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-7xl w-full">{content}</div>
      </div>
    );
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4">
      <div className="max-w-7xl mx-auto">{content}</div>
    </section>
  );
};

export default BillboardSkeleton;
