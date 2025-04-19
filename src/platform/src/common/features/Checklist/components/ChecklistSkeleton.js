import React from 'react';
import Card from '@/components/CardWrapper';

const SkeletonCard = () => (
  <Card width="w-full" padding="py-4 px-3" contentClassName="space-y-4">
    <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
    <div className="space-y-2">
      <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse" />
      <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="flex justify-between">
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-10 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  </Card>
);

const ChecklistSkeleton = () => (
  <div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div className="w-full md:w-1/2 space-y-2">
        <div className="w-64 h-7 bg-gray-200 rounded animate-pulse" />
        <div className="w-80 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-full md:w-1/2 mt-4 md:mt-0 flex justify-end">
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 animate-pulse" />
      </div>
    </div>
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      {Array(4)
        .fill()
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  </div>
);

export default ChecklistSkeleton;
