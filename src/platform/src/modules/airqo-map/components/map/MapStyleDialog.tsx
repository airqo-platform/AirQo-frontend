'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';

// Map style dialog component for selecting map appearance

export interface MapStyle {
  id: string;
  name: string;
  url: string;
  nodeStyle: 'emoji' | 'heatmap' | 'node' | 'number';
  description?: string;
}

// Map detail styles (from the image)
const mapDetailStyles = [
  {
    id: 'emoji',
    name: 'Emoji',
    nodeStyle: 'emoji' as const,
  },
  {
    id: 'heatmap',
    name: 'Heatmap', 
    nodeStyle: 'heatmap' as const,
  },
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

  if (!isOpen) return null;

  const handleApply = () => {
    const selectedStyle = defaultMapStyles.find(style => style.id === selectedMapType);
    if (selectedStyle) {
      const updatedStyle = {
        ...selectedStyle,
        nodeStyle: selectedDetail as 'emoji' | 'heatmap' | 'node' | 'number'
      };
      onStyleChange(updatedStyle);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn("bg-white rounded-lg shadow-xl w-full max-w-md", className)}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Map Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Choose a map style that best fits your needs
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Map Details Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Map Details</h3>
            <div className="grid grid-cols-2 gap-2">
              {mapDetailStyles.map((detail) => (
                <button
                  key={detail.id}
                  onClick={() => setSelectedDetail(detail.id)}
                  className={cn(
                    "p-3 text-sm rounded-lg border transition-all duration-200",
                    "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    selectedDetail === detail.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
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
              {defaultMapStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedMapType(style.id)}
                  className={cn(
                    "p-3 text-sm rounded-lg border transition-all duration-200 text-left",
                    "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    selectedMapType === style.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="font-medium">{style.name}</div>
                  {style.id === 'satellite' && (
                    <div className="text-xs text-gray-500 mt-1">Aerial view</div>
                  )}
                  {style.id === 'light' && (
                    <div className="text-xs text-gray-500 mt-1">Minimal design</div>
                  )}
                  {style.id === 'dark' && (
                    <div className="text-xs text-gray-500 mt-1">Dark theme</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};