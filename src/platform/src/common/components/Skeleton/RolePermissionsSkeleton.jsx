import React from 'react';
import CardWrapper from '@/common/components/CardWrapper';

const SkeletonBox = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

const RolePermissionsSkeleton = () => (
  <div className="py-8">
    <div className="mb-8">
      <SkeletonBox className="h-8 w-64 mb-2" />
      <SkeletonBox className="h-4 w-40" />
    </div>
    <div className="mb-6">
      <SkeletonBox className="h-10 w-full" />
    </div>
    <CardWrapper className="border border-blue-200 rounded-lg mb-6">
      <SkeletonBox className="h-4 w-32 mb-2" />
      <SkeletonBox className="h-3 w-24" />
    </CardWrapper>
    <CardWrapper>
      <div>
        <SkeletonBox className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBox key={i} className="h-20 w-full mb-2" />
          ))}
        </div>
      </div>
    </CardWrapper>
  </div>
);

export default RolePermissionsSkeleton;
