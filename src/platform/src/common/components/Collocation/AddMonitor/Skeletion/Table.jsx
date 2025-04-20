import React from 'react';
import { Skeleton } from './Skeleton';

export const Table = () => (
  <div className="w-full">
    <div className="flex justify-between items-center flex-wrap mb-3 px-6">
      <Skeleton className="w-[280px] h-9" />
      <div className="flex space-x-2 grow justify-end">
        <Skeleton className="w-[114px] h-9" />
        <Skeleton className="w-[124px] h-9" />
      </div>
    </div>

    <div className="overflow-x-scroll md:overflow-x-hidden">
      <div className="mb-6">
        <div className="flex items-center pl-5 h-10 border-b border-skeleton pb-3 space-x-8">
          <Skeleton className="w-5 h-[15px]" />
          <Skeleton className="w-[84px] h-3" />
          <Skeleton className="w-[84px] h-3" />
          <Skeleton className="w-[84px] h-3" />
          <Skeleton className="w-[84px] h-3" />
        </div>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center pl-5 h-14 border-b border-skeleton space-x-8"
          >
            <Skeleton className="w-5 h-[15px]" />
            <Skeleton className="w-[62px] h-3" />
            <Skeleton className="w-[88px] h-3" />
            <Skeleton className="w-[119px] h-3" />
            <Skeleton className="w-[119px] h-3" />
          </div>
        ))}
      </div>
      <Skeleton className="w-[83px] h-7 mx-auto mb-10" />
    </div>
  </div>
);

export default Table;
