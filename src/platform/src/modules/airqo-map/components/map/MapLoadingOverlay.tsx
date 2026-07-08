'use client';

import React from 'react';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { cn } from '@/shared/lib/utils';

interface MapLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({
  isVisible,
  message = 'Refreshing map data...',
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-[1100] flex items-center justify-center',
        'bg-black bg-opacity-30 backdrop-blur-sm transition-all duration-300',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs mx-4 text-center">
        {/* Spinning refresh icon */}
        <div className="flex justify-center">
          <LoadingSpinner className="text-primary" />
        </div>
      </div>
    </div>
  );
};
