import React from 'react';
import CardWrapper from '@/common/components/CardWrapper';

const SkeletonBox = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

const isAdmin = true;

const DashboardPageSkeleton = () => (
  <>
    {/* Welcome Card Skeleton */}
    <CardWrapper
      className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary to-primary/80 text-white"
      padding="p-8 lg:p-12"
    >
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
        <div className="space-y-3">
          <SkeletonBox className="h-8 w-80 bg-white/20" />
          <SkeletonBox className="h-5 w-96 bg-white/10" />
        </div>
      </div>
      {/* Subtle background decoration using primary color */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full translate-y-32 -translate-x-32" />
    </CardWrapper>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {/* Sites Monitored Card Skeleton (public) */}
      <div className="md:col-span-1 lg:col-span-1">
        <CardWrapper
          className="border-0 shadow-lg bg-white dark:bg-gray-800 relative overflow-hidden rounded-2xl p-0"
          padding=""
        >
          <div className="flex flex-col h-full justify-center p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-12 h-12 rounded-xl bg-primary/10" />
                <div className="flex flex-col">
                  <SkeletonBox className="h-4 w-24 mb-1" />
                  <SkeletonBox className="h-3 w-32" />
                </div>
              </div>
              <SkeletonBox className="h-10 w-16" />
            </div>
          </div>
        </CardWrapper>
      </div>
      {/* Total Members Card Skeleton (admin only) */}
      {isAdmin && (
        <div className="md:col-span-1 lg:col-span-1">
          <CardWrapper
            className="border-0 shadow-lg bg-white dark:bg-gray-800 relative overflow-hidden rounded-2xl p-0"
            padding=""
          >
            <div className="flex flex-col h-full justify-center p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-12 h-12 rounded-xl bg-primary/20" />
                  <div className="flex flex-col">
                    <SkeletonBox className="h-4 w-24 mb-1" />
                    <SkeletonBox className="h-3 w-32" />
                  </div>
                </div>
                <SkeletonBox className="h-10 w-16" />
              </div>
            </div>
          </CardWrapper>
        </div>
      )}
    </div>
  </>
);

export default DashboardPageSkeleton;
