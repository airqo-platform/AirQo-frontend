import React from 'react';
import Skeleton from './Skeleton';
import CardWrapper from '../CardWrapper';

/**
 * Loading skeleton for the User Details page
 */
const UserDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header with back button skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton width="100px" height="36px" className="rounded-md" />
        <div className="flex-1">
          <Skeleton width="200px" height="32px" className="mb-2" />
          <Skeleton width="300px" height="20px" />
        </div>
      </div>

      {/* User Overview Card Skeleton */}
      <CardWrapper>
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            {/* Avatar */}
            <Skeleton circle width="80px" height="80px" />

            <div className="flex-1">
              {/* User name */}
              <Skeleton width="250px" height="32px" className="mb-2" />
              {/* Job title */}
              <Skeleton width="180px" height="20px" className="mb-2" />
              {/* Status badges */}
              <div className="flex items-center space-x-4">
                <Skeleton width="80px" height="24px" className="rounded-full" />
                <Skeleton width="120px" height="20px" />
              </div>
            </div>
          </div>

          {/* User info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3">
                {/* Icon */}
                <Skeleton
                  circle
                  width="32px"
                  height="32px"
                  className="mt-0.5"
                />
                <div className="flex-1">
                  {/* Label */}
                  <Skeleton width="120px" height="16px" className="mb-1" />
                  {/* Value */}
                  <Skeleton width="180px" height="16px" />
                </div>
              </div>
            ))}
          </div>

          {/* Description section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Skeleton circle width="32px" height="32px" className="mt-0.5" />
              <div className="flex-1">
                <Skeleton width="100px" height="16px" className="mb-1" />
                <Skeleton width="100%" height="48px" />
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>

      {/* Groups and Roles Card Skeleton */}
      <CardWrapper>
        <div className="p-6">
          {/* Section header */}
          <div className="flex items-center mb-4">
            <Skeleton circle width="20px" height="20px" className="mr-2" />
            <Skeleton width="150px" height="24px" />
          </div>

          {/* Groups list */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton circle width="32px" height="32px" />
                    <div>
                      <Skeleton width="150px" height="20px" className="mb-1" />
                      <Skeleton width="100px" height="16px" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton
                      width="60px"
                      height="20px"
                      className="rounded-full"
                    />
                    <Skeleton width="50px" height="20px" className="rounded" />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <Skeleton width="80px" height="16px" className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Array.from({ length: 4 }).map((_, permIndex) => (
                      <Skeleton
                        key={permIndex}
                        width="120px"
                        height="28px"
                        className="rounded-md"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardWrapper>

      {/* API Clients Card Skeleton */}
      <CardWrapper>
        <div className="p-6">
          {/* Section header */}
          <div className="flex items-center mb-4">
            <Skeleton circle width="20px" height="20px" className="mr-2" />
            <Skeleton width="120px" height="24px" />
          </div>

          {/* API clients list */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <Skeleton width="150px" height="20px" className="mb-1" />
                  <Skeleton width="200px" height="16px" />
                </div>
                <Skeleton width="60px" height="20px" className="rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </CardWrapper>

      {/* Networks Card Skeleton */}
      <CardWrapper>
        <div className="p-6">
          {/* Section header */}
          <div className="flex items-center mb-4">
            <Skeleton circle width="20px" height="20px" className="mr-2" />
            <Skeleton width="100px" height="24px" />
          </div>

          {/* Networks list */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <Skeleton width="180px" height="20px" />
                  <Skeleton width="50px" height="20px" className="rounded" />
                </div>

                <Skeleton width="100%" height="40px" className="mb-3" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton width="150px" height="16px" />
                  </div>
                  <div>
                    <Skeleton width="120px" height="16px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardWrapper>
    </div>
  );
};

export default UserDetailsSkeleton;
