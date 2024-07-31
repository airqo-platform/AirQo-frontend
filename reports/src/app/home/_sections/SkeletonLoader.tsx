import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonLoader = () => {
  return (
    <>
      <Skeleton className="h-[50px] rounded-md w-[150px] bg-slate-300" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-[50px] rounded-md w-full bg-slate-300"
        />
      ))}
      <div className="flex space-x-3">
        <Skeleton className="h-[50px] rounded-md w-[200px] bg-slate-300" />
        <Skeleton className="h-[50px] rounded-md w-[150px] bg-slate-300" />
      </div>
    </>
  );
};

export default SkeletonLoader;
