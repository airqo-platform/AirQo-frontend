import React from 'react';
import { Skeleton } from './Skeleton';
import GraphCard from './GraphCard';

export const OverviewSkeleton = () => (
  <div className="grid grid-rows-[auto,1fr,auto] divide-y divide-skeleton px-6">
    <div className="p-6 space-y-2">
      <Skeleton className="w-[257px] h-6" />
      <Skeleton className="w-[121px] h-4" />
    </div>
    <div className="grid lg:grid-cols-2 divide-x divide-skeleton">
      <GraphCard />
      <GraphCard />
    </div>
    <div className="divide-y divide-skeleton pt-20 mb-6 md:mb-20">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between p-6 md:px-12">
          <Skeleton className="w-[121px] h-6" />
          <Skeleton className={i === 1 ? 'w-[121px] h-6' : 'w-[181px] h-6'} />
        </div>
      ))}
    </div>
  </div>
);

export default OverviewSkeleton;
