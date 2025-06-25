import React from 'react';
import Skeleton from '@/common/components/Skeleton';

const HomeSkeleton = () => {
  return (
    <div className="px-3 lg:px-16 py-3 space-y-5">
      <div className="w-full mb-4 md:mb-10">
        <Skeleton className="text-[32px] leading-10 font-medium h-10 w-3/4" />
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="w-full flex flex-col items-start">
          <Skeleton className="text-2xl font-medium h-7 w-1/2" />
          <Skeleton className="text-sm font-normal h-5 w-3/4" />
        </div>
        <div className="w-full">
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="w-full h-[250px] flex flex-col justify-between items-start border-[0.5px] rounded-xl border-grey-150 py-5 px-3 space-y-5 focus:outline-[var(--org-primary,var(--color-primary,#145fff))] focus:ring-2 focus:shadow-lg focus:border-[var(--org-primary,var(--color-primary,#145fff))] animate-pulse"
            tabIndex={0}
          >
            <Skeleton className="w-full h-14" variant="circular" />
            <Skeleton className="w-full text-base font-normal h-5" />
            <div className="w-full text-sm flex justify-between font-normal h-5">
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-1/4 h-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-center border-[0.5px] rounded-xl border-grey-150 p-3">
        <div className="flex flex-col justify-start p-8 animate-pulse">
          <Skeleton className="text-2xl font-medium h-7 w-3/4" />
          <Skeleton className="text-lg font-normal h-5 w-3/4" />
          <div className="mt-4 flex items-center space-x-8">
            <Skeleton className="rounded-lg w-32 h-12" />
            <Skeleton className="text-sm font-normal h-5 w-1/4" />
          </div>
        </div>
        <div
          className="rounded-md p-9 relative bg-gray-300"
          style={{
            background: 'rgba(var(--org-primary-rgb, 20, 95, 255), 0.03)',
          }}
        >
          <div className="absolute z-50 inset-0 flex items-center justify-center cursor-pointer">
            <Skeleton className="w-8 h-8" variant="circular" />
          </div>
          <Skeleton className="h-48 w-72" />
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
