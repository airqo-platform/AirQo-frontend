'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface ForumLoadingProps {
  className?: string;
  message?: string;
}

const ForumLoading: React.FC<ForumLoadingProps> = ({
  className,
  message = 'Loading Clean Air Forum…',
}) => {
  return (
    <div
      className={cn(
        'flex min-h-72 w-full items-center justify-center p-8',
        className,
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center gap-3">
        {/* Spinner */}
        <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        {/* Text */}
        <h3 className="text-base font-semibold text-gray-900">{message}</h3>
        <p className="text-sm text-gray-600">
          Please wait while we fetch the latest information…
        </p>
      </div>
    </div>
  );
};

export default ForumLoading;
