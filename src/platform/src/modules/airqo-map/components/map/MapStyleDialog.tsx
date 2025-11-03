'use client';

import React, { useState } from 'react';
import { Dialog } from '@/shared/components/ui';

// Map style dialog component for selecting map appearance

export interface MapStyle {
  id: string;
  name: string;
  url: string;
  nodeStyle: 'emoji' | 'node' | 'number';
  description?: string;
}

// Map detail styles (from the image)
const mapDetailStyles = [
  {
    id: 'emoji',
    name: 'Emoji',
    nodeStyle: 'emoji' as const,
  },
  // {
  //   id: 'heatmap',
  //   name: 'Heatmap',
  //   nodeStyle: 'heatmap' as const,
  // },
  {
    id: 'node',
    name: 'Node',
    nodeStyle: 'node' as const,
  },
  {
    id: 'number',
    name: 'Number',
    nodeStyle: 'number' as const,
  },
];

const defaultMapStyles: MapStyle[] = [
  {
    id: 'streets',
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    nodeStyle: 'emoji',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    nodeStyle: 'emoji',
  },
  {
    id: 'light',
    name: 'Light',
    url: 'mapbox://styles/mapbox/light-v11',
    nodeStyle: 'emoji',
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    nodeStyle: 'emoji',
  },
];

interface MapStyleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStyleChange: (style: MapStyle) => void;
  currentStyle: string;
  className?: string;
}

export const MapStyleDialog: React.FC<MapStyleDialogProps> = ({
  isOpen,
  onClose,
  onStyleChange,
  currentStyle,
  className,
}) => {
  const [selectedDetail, setSelectedDetail] = useState('emoji');
  const [selectedMapType, setSelectedMapType] = useState(() => {
    const current = defaultMapStyles.find(style => style.url === currentStyle);
    return current?.id || 'streets';
  });

  const handleApply = () => {
    const selectedStyle = defaultMapStyles.find(
      style => style.id === selectedMapType
    );
    if (selectedStyle) {
      const updatedStyle = {
        ...selectedStyle,
        nodeStyle: selectedDetail as 'emoji' | 'node' | 'number',
      };
      onStyleChange(updatedStyle);
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Map Settings"
      subtitle="Choose a map style that best fits your needs"
      size="md"
      primaryAction={{
        label: 'Apply',
        onClick: handleApply,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
      }}
      className={className}
    >
      <div className="space-y-6">
        {/* Map Details Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Map Details
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {mapDetailStyles.map(detail => (
              <button
                key={detail.id}
                onClick={() => setSelectedDetail(detail.id)}
                className={`p-3 text-sm rounded-lg border transition-all duration-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedDetail === detail.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {detail.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map Type Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Map Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {defaultMapStyles.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedMapType(style.id)}
                className={`p-3 text-sm rounded-lg border transition-all duration-200 text-left hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedMapType === style.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{style.name}</div>
                {style.id === 'satellite' && (
                  <div className="text-xs text-gray-500 mt-1">Aerial view</div>
                )}
                {style.id === 'light' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Minimal design
                  </div>
                )}
                {style.id === 'dark' && (
                  <div className="text-xs text-gray-500 mt-1">Dark theme</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
