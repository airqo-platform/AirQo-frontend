'use client';

import React from 'react';
import { RiRefreshLine } from 'react-icons/ri';
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
        'absolute inset-0 z-50 flex items-center justify-center',
        'bg-black bg-opacity-30 backdrop-blur-sm transition-all duration-300',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-xs mx-4 text-center">
        {/* Spinning refresh icon */}
        <div className="flex justify-center mb-4">
          <RiRefreshLine
            size={32}
            className="text-blue-600 animate-spin"
            aria-hidden="true"
          />
        </div>

        {/* Loading message */}
        <p className="text-gray-700 font-medium mb-2">{message}</p>

        {/* Progress dots */}
        <div className="flex justify-center space-x-1">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        {/* Accessible text for screen readers */}
        <span className="sr-only">Loading content, please wait...</span>
      </div>
    </div>
  );
};
