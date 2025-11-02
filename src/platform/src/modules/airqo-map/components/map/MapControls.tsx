'use client';

import React from 'react';
import {
  AqRefreshCcw04,
  AqCompass01,
  AqLayersThree01,
  AqLink03,
  AqPlus,
  AqMinus,
} from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/components/ui';

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
      toast.success('Link copied to clipboard');
      onCopyLink?.();
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  interface ControlButton {
    icon: React.ComponentType<{
      size?: number | string;
      className?: string;
      color?: string;
    }>;
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
        'w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-gray-50 border border-gray-200 rounded-full',
        'shadow-md hover:shadow-lg transition-all duration-200',
        'flex items-center justify-center text-gray-700 hover:text-gray-900',
        'focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        control.disabled && 'cursor-not-allowed opacity-50'
      )}
      title={control.label}
    >
      <control.icon size={18} />
    </button>
  );

  const renderRoundedControlButton = (
    control: ControlButton,
    index: number,
    position: 'top' | 'middle' | 'bottom' | 'single'
  ) => (
    <button
      key={`${control.label}-${index}`}
      onClick={control.onClick}
      disabled={control.disabled}
      aria-label={control['aria-label']}
      className={cn(
        'w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-gray-50 border border-gray-200',
        'shadow-md hover:shadow-lg transition-all duration-200',
        'flex items-center justify-center text-gray-700 hover:text-gray-900',
        'focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        control.disabled && 'cursor-not-allowed opacity-50',
        // Rounded corners based on position
        position === 'single' && 'rounded-full',
        position === 'top' && 'rounded-t-full rounded-b-none border-b-0',
        position === 'middle' && 'rounded-none border-b-0',
        position === 'bottom' && 'rounded-b-full rounded-t-none'
      )}
      title={control.label}
    >
      <control.icon size={18} />
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
            icon: AqLayersThree01,
            label: 'Map styles',
            onClick: onMapStyleToggle,
            'aria-label': 'Toggle map style options',
          },
          0
        )}

        {/* Copy link */}
        {renderControlButton(
          {
            icon: AqLink03,
            label: 'Copy map link',
            onClick: handleCopyLink,
            'aria-label': 'Copy current map view link',
          },
          1
        )}

        {/* Refresh */}
        {renderControlButton(
          {
            icon: AqRefreshCcw04,
            label: 'Refresh map',
            onClick: onRefreshMap,
            'aria-label': 'Refresh map data',
            disabled: isRefreshing,
          },
          2
        )}
      </div>

      {/* Bottom right controls - grouped zoom controls */}
      <div
        className={cn(
          'absolute bottom-4 right-4 z-10 flex flex-col',
          'sm:bottom-6 sm:right-6'
        )}
      >
        {/* Geolocation */}
        <div className="mb-2">
          {renderControlButton(
            {
              icon: AqCompass01,
              label: 'Find my location',
              onClick: onGeolocation,
              'aria-label': 'Geolocate to current position',
            },
            0
          )}
        </div>

        {/* Zoom controls - stuck together */}
        <div className="flex flex-col">
          {renderRoundedControlButton(
            {
              icon: AqPlus,
              label: 'Zoom in',
              onClick: onZoomIn,
              'aria-label': 'Zoom in on map',
            },
            1,
            'top'
          )}
          {renderRoundedControlButton(
            {
              icon: AqMinus,
              label: 'Zoom out',
              onClick: onZoomOut,
              'aria-label': 'Zoom out on map',
            },
            2,
            'bottom'
          )}
        </div>
      </div>
    </>
  );
};
