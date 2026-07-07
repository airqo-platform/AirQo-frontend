import React from 'react';

import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6',
        className,
      )}
    >
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingState;
