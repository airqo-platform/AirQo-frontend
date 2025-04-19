import React from 'react';
import { Skeleton } from './Skeleton';

export const GraphCard = () => (
  <div className="grid grid-cols-5 divide-x divide-skeleton">
    <div className="col-span-3 flex flex-col p-4 ml-2 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="w-[94px] h-4" />
        <Skeleton className="w-[68px] h-4" />
      </div>
      <Skeleton className="w-[94px] h-7 mt-4" />
      <div className="flex justify-between items-end mt-10">
        <Skeleton className="w-24 h-28" />
        <Skeleton className="w-24 h-20" />
      </div>
    </div>
    <div className="col-span-2 flex flex-col py-6">
      <div className="border-b border-grey-150 px-5 pb-6 space-y-1">
        <Skeleton className="w-[94px] h-4" />
        <Skeleton className="max-w-[181px] h-12" />
      </div>
      <div className="px-5 pt-6 space-y-1">
        <Skeleton className="w-[94px] h-4" />
        <Skeleton className="max-w-[181px] h-12" />
      </div>
    </div>
  </div>
);

export default GraphCard;
