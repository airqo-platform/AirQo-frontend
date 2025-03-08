import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Define TypeScript types for props
interface MapStyle {
  name: string;
  image: string;
  url:string
  
}

interface MapDetail {
  name: string;
  image: string | object;
}

interface LayerModalProps {
        
  isOpen: boolean;
  onClose: () => void;
  onMapDetailsSelect: (name: string) => void;
  onStyleSelect: (style: MapStyle) => void;
  mapStyles: MapStyle[];
  mapDetails: MapDetail[];
  disabled?: string;
}

const LayerModal: React.FC<LayerModalProps> = ({
  isOpen,
  onClose,
  onMapDetailsSelect,
  onStyleSelect,
  mapStyles,
  mapDetails,
  disabled,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<MapStyle>(mapStyles[0]);
  const [selectedMapDetail, setSelectedMapDetail] = useState<MapDetail>(mapDetails[0]);

  useEffect(() => {
    if (mapStyles[0]) {
      setSelectedStyle(mapStyles[0]);
    }
    if (mapDetails[0]) {
      setSelectedMapDetail(mapDetails[0]);
    }
  }, [mapStyles, mapDetails]);

  const handleApply = useCallback(() => {
    onStyleSelect(selectedStyle);
    onMapDetailsSelect(selectedMapDetail.name);
    onClose();
  }, [selectedStyle, selectedMapDetail, onStyleSelect, onMapDetailsSelect, onClose]);

  const handleSelectStyle = useCallback((style: MapStyle) => {
    setSelectedStyle(style);
  }, []);

  const handleSelectDetail = useCallback((detail: MapDetail) => {
    setSelectedMapDetail(detail);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-[#4e4e4e3b]" onClick={onClose}></div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-50 bg-white rounded-lg overflow-hidden shadow-xl sm:max-w-lg sm:w-full"
      >
        <div className="p-4 md:p-6 text-left">
          <h3 className="text-lg font-semibold mb-3">Map Details</h3>
          <div className="flex justify-between space-x-2">
            {mapDetails.map((detail) => (
              <button
                key={detail.name}
                onClick={() => handleSelectDetail(detail)}
                className={`flex flex-col items-center space-y-3 ${
                  detail.name === selectedMapDetail.name ? 'border-blue-500' : ''
                } ${disabled === detail.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={disabled === detail.name}
              >
                <div className="w-8 h-8 md:w-14 md:h-14 relative rounded-lg border-2">
                  <Image
                    src={typeof detail.image === 'string' ? detail.image : ''}
                    alt={detail.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    loading="eager"
                  />
                </div>
                <span>{detail.name}</span>
              </button>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-[2px] my-2" />
          <h3 className="text-lg font-semibold mb-3">Map Type</h3>
          <div className="flex justify-between">
            {mapStyles.map((style) => (
              <button
                key={style.name}
                onClick={() => handleSelectStyle(style)}
                className={`flex flex-col items-center space-y-3 ${
                  style.name === selectedStyle.name ? 'border-blue-500' : ''
                }`}
              >
                <div className="w-8 h-8 md:w-14 md:h-14 relative rounded-lg border-2">
                  <Image
                    src={style.image}
                    alt={style.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    loading="eager"
                  />
                </div>
                <span>{style.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end w-full p-4 md:p-6 space-x-4 bg-[#F9FAFB]">
          <button
            onClick={onClose}
            className="p-2 md:px-4 md:py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="p-2 md:px-4 md:py-2 bg-blue-600 rounded-md text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayerModal;
