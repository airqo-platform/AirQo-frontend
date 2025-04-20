import React from 'react';
import Calendar from './Calendar';
import Table from './Table';
import { Skeleton } from './Skeleton';

export const SkeletonFrame = () => (
  <div className="flex space-x-6">
    <div className="border border-skeleton rounded-l-lg md:max-w-[704px] w-auto mb-6">
      <div className="px-6 pt-6 mb-6 space-y-2">
        <Skeleton className="w-[257px] h-6" />
        <Skeleton className="w-72 h-4" />
      </div>
      <Table />
    </div>
    <Calendar />
  </div>
);

export default SkeletonFrame;
