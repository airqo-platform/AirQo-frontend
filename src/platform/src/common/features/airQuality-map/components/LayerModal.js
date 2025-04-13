import React, { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
// Import Card wrapper component
import Card from '@/components/CardWrapper';

/**
 * Option component for rendering each selectable option.
 * Wrapped with React.memo for performance optimization.
 */
const Option = memo(({ isSelected, children, onSelect, image, disabled }) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      try {
        onSelect();
      } catch (error) {
        console.error('Error in Option onSelect handler:', error);
      }
    }
  }, [onSelect, disabled]);

  const containerClasses = `
    flex flex-col items-center space-y-2 
    transition-transform duration-200 transform 
    ${isSelected ? 'border-blue-500 scale-105' : 'hover:scale-105'} 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  // Increased image size for better spacing.
  const imageContainerClasses = `
    relative w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 
    transition-colors duration-200 
    ${isSelected ? 'border-blue-500 ring-4 ring-light-blue-100' : 'border-gray-300'}
  `;

  return (
    <button
      onClick={handleClick}
      className={containerClasses}
      disabled={disabled}
    >
      <div className={imageContainerClasses}>
        <Image
          src={image}
          alt={children}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
          loading="eager"
          priority={isSelected}
        />
      </div>
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
});

Option.displayName = 'Option';

Option.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  image: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

Option.defaultProps = {
  disabled: false,
};

/**
 * LayerModal component for selecting map style and details.
 */
const LayerModal = ({
  isOpen,
  onClose,
  onMapDetailsSelect,
  onStyleSelect,
  mapStyles,
  mapDetails,
  disabled,
}) => {
  const [selectedStyle, setSelectedStyle] = useState(mapStyles[0]);
  const [selectedMapDetail, setSelectedMapDetail] = useState(mapDetails[0]);

  // Reset selections when the provided options change
  useEffect(() => {
    if (mapStyles[0]) setSelectedStyle(mapStyles[0]);
    if (mapDetails[0]) setSelectedMapDetail(mapDetails[0]);
  }, [mapStyles, mapDetails]);

  const handleApply = useCallback(() => {
    try {
      onStyleSelect(selectedStyle);
      onMapDetailsSelect(selectedMapDetail.name);
      onClose();
    } catch (error) {
      console.error('Error applying layer modal selections:', error);
    }
  }, [
    selectedStyle,
    selectedMapDetail,
    onStyleSelect,
    onMapDetailsSelect,
    onClose,
  ]);

  const handleSelectStyle = useCallback((style) => {
    setSelectedStyle(style);
  }, []);

  const handleSelectDetail = useCallback((detail) => {
    setSelectedMapDetail(detail);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      style={{ zIndex: 10000 }}
    >
      <Card
        className="relative mx-4 max-w-lg w-full"
        padding="p-0"
        shadow="shadow"
        rounded
        radius="rounded-xl"
      >
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-4">Map Details</h3>
          <div className="flex flex-wrap justify-around gap-6">
            {mapDetails.map((detail) => (
              <Option
                key={detail.name}
                isSelected={detail.name === selectedMapDetail.name}
                onSelect={() => handleSelectDetail(detail)}
                disabled={detail.name === disabled}
                image={detail.image}
              >
                {detail.name}
              </Option>
            ))}
          </div>
          <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-6" />
          <h3 className="text-2xl font-semibold mb-4">Map Type</h3>
          <div className="flex flex-wrap justify-around gap-6">
            {mapStyles.map((style) => (
              <Option
                key={style.name}
                image={style.image}
                isSelected={style.name === selectedStyle.name}
                onSelect={() => handleSelectStyle(style)}
              >
                {style.name}
              </Option>
            ))}
          </div>
        </div>
        <div
          className="flex justify-end items-center w-full p-4 bg-gray-50 dark:bg-gray-700 space-x-4"
          style={{
            borderBottomLeftRadius: '0.75rem',
            borderBottomRightRadius: '0.75rem',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </Card>
    </div>
  );
};

LayerModal.displayName = 'LayerModal';

LayerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMapDetailsSelect: PropTypes.func.isRequired,
  onStyleSelect: PropTypes.func.isRequired,
  mapStyles: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    }),
  ).isRequired,
  mapDetails: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    }),
  ).isRequired,
  disabled: PropTypes.string,
};

LayerModal.defaultProps = {
  disabled: '',
};

export default LayerModal;
