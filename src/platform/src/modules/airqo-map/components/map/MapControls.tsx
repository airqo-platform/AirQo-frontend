'use client';

import React from 'react';
import {
  RiAddLine,
  RiSubtractLine,
  RiLinkM,
  RiRefreshLine,
  RiStackLine,
} from 'react-icons/ri';
import { MdMyLocation } from 'react-icons/md';
import { cn } from '@/shared/lib/utils';

interface MapControlsProps {
  onGeolocation?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCopyLink?: () => void;
  onRefreshMap?: () => void;
  onMapStyleToggle?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onGeolocation,
  onZoomIn,
  onZoomOut,
  onCopyLink,
  onRefreshMap,
  onMapStyleToggle,
  isRefreshing = false,
  className,
}) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You can add a toast notification here
      console.log('Link copied to clipboard');
      onCopyLink?.();
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  interface ControlButton {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    onClick?: () => void;
    'aria-label': string;
    disabled?: boolean;
  }

  const renderControlButton = (control: ControlButton, index: number) => (
    <button
      key={`${control.label}-${index}`}
      onClick={control.onClick}
      disabled={control.disabled}
      aria-label={control['aria-label']}
      className={cn(
        'w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-gray-50 border border-gray-200',
        'rounded-lg shadow-md hover:shadow-lg transition-all duration-200',
        'flex items-center justify-center text-gray-700 hover:text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        control.disabled && 'cursor-not-allowed opacity-50'
      )}
      title={control.label}
    >
      <control.icon
        size={18}
        className={cn(
          control.disabled &&
            isRefreshing &&
            control.label === 'Refresh map' &&
            'animate-spin'
        )}
      />
    </button>
  );

  return (
    <>
      {/* Top right controls */}
      <div
        className={cn(
          'absolute top-4 right-4 z-10 flex flex-col gap-2',
          'sm:top-6 sm:right-6',
          className
        )}
      >
        {/* Map style toggle */}
        {renderControlButton(
          {
            icon: RiStackLine,
            label: 'Map styles',
            onClick: onMapStyleToggle,
            'aria-label': 'Toggle map style options',
          },
          0
        )}

        {/* Copy link */}
        {renderControlButton(
          {
            icon: RiLinkM,
            label: 'Copy map link',
            onClick: handleCopyLink,
            'aria-label': 'Copy current map view link',
          },
          1
        )}

        {/* Refresh */}
        {renderControlButton(
          {
            icon: RiRefreshLine,
            label: 'Refresh map',
            onClick: onRefreshMap,
            'aria-label': 'Refresh map data',
            disabled: isRefreshing,
          },
          2
        )}
      </div>

      {/* Bottom right controls */}
      <div
        className={cn(
          'absolute bottom-4 right-4 z-10 flex flex-col gap-2',
          'sm:bottom-6 sm:right-6'
        )}
      >
        {/* Geolocation */}
        {renderControlButton(
          {
            icon: MdMyLocation,
            label: 'Find my location',
            onClick: onGeolocation,
            'aria-label': 'Geolocate to current position',
          },
          0
        )}

        {/* Zoom in */}
        {renderControlButton(
          {
            icon: RiAddLine,
            label: 'Zoom in',
            onClick: onZoomIn,
            'aria-label': 'Zoom in on map',
          },
          1
        )}

        {/* Zoom out */}
        {renderControlButton(
          {
            icon: RiSubtractLine,
            label: 'Zoom out',
            onClick: onZoomOut,
            'aria-label': 'Zoom out on map',
          },
          2
        )}
      </div>
    </>
  );
};
