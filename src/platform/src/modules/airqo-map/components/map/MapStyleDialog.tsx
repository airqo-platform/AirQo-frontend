'use client';

import React, { useState } from 'react';
import { Dialog } from '@/shared/components/ui';
import Image from 'next/image';

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
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Map Details
          </h3>
          <div className="flex gap-2">
            {mapDetailStyles.map(detail => (
              <button
                key={detail.id}
                onClick={() =>
                  detail.id !== 'heatmap' && setSelectedDetail(detail.id)
                }
                disabled={detail.id === 'heatmap'}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary min-w-[90px] ${
                  detail.id === 'heatmap'
                    ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                    : selectedDetail === detail.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-8 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {detail.id === 'emoji' && (
                    <Image
                      src="/images/map/Emoji.webp"
                      alt="Emoji style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                  {detail.id === 'node' && (
                    <Image
                      src="/images/map/Node.webp"
                      alt="Node style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                  {detail.id === 'number' && (
                    <Image
                      src="/images/map/Node_number.webp"
                      alt="Number style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                  {detail.id === 'heatmap' && (
                    <Image
                      src="/images/map/Heatmap.webp"
                      alt="Heatmap style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                </div>
                <span className="text-xs font-medium">{detail.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Type Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Map Type</h3>
          <div className="flex gap-2">
            {defaultMapStyles.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedMapType(style.id)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border transition-all duration-200 text-center hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary min-w-[90px] ${
                  selectedMapType === style.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-8 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {style.id === 'streets' && (
                    <Image
                      src="/images/map/street.webp"
                      alt="Streets map style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                  {style.id === 'satellite' && (
                    <Image
                      src="/images/map/satellite.webp"
                      alt="Satellite map style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                  {style.id === 'light' && (
                    <Image
                      src="/images/map/light.webp"
                      alt="Light map style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                  {style.id === 'dark' && (
                    <Image
                      src="/images/map/dark.webp"
                      alt="Dark map style"
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  )}
                </div>
                <div className="font-medium text-xs">{style.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
