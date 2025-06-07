import React, { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Card from '@/components/CardWrapper';

/**
 * Option component for rendering each selectable option.
 * Uses React.memo to prevent unnecessary re-renders.
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
    transition-all duration-300 ease-in-out
    ${isSelected ? 'scale-105' : 'hover:scale-105'} 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const imageContainerClasses = `
    relative w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 
    transition-all duration-300 ease-in-out
    ${isSelected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-300'}
  `;

  return (
    <button
      onClick={handleClick}
      className={containerClasses}
      disabled={disabled}
      aria-pressed={isSelected}
      type="button"
    >
      <div className={imageContainerClasses}>
        {' '}
        <Image
          src={image}
          alt={`${children} option`}
          fill
          style={{ objectFit: 'cover' }}
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
 * LayerModal component for selecting map style and details
 * with improved selection handling.
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
  // Find the Streets option by default or use the first style
  const defaultStyle =
    mapStyles.find((style) => style.name === 'Streets') || mapStyles[0];
  const defaultDetail =
    mapDetails.find((detail) => detail.name === 'Emoji') || mapDetails[0];

  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  const [selectedMapDetail, setSelectedMapDetail] = useState(defaultDetail);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset selections when modal is opened
  useEffect(() => {
    if (isOpen) {
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleSelectStyle = useCallback(
    (style) => {
      if (style.name !== selectedStyle.name) {
        setSelectedStyle(style);
        setHasChanges(true);
      }
    },
    [selectedStyle],
  );

  const handleSelectDetail = useCallback(
    (detail) => {
      if (detail.name !== selectedMapDetail.name) {
        setSelectedMapDetail(detail);
        setHasChanges(true);
      }
    },
    [selectedMapDetail],
  );

  const handleApply = useCallback(() => {
    try {
      // Only apply changes if something actually changed
      if (hasChanges) {
        onStyleSelect(selectedStyle);
        onMapDetailsSelect(selectedMapDetail.name);
      }
      onClose();
    } catch (error) {
      console.error('Error applying layer modal selections:', error);
    }
  }, [
    hasChanges,
    selectedStyle,
    selectedMapDetail,
    onStyleSelect,
    onMapDetailsSelect,
    onClose,
  ]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        zIndex: 10000,
      }}
    >
      <Card
        className="relative mx-4 max-w-lg w-full"
        padding="p-0"
        shadow="shadow-lg"
        rounded
        radius="rounded-xl"
      >
        <div className="p-6">
          <div className="flex justify-start items-center mb-4">
            <h3 className="text-2xl font-semibold">Map Details</h3>
          </div>

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

        <div className="flex justify-end items-center w-full p-4 bg-gray-50 dark:bg-gray-700 space-x-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className={`
              px-4 py-2 rounded-md text-white transition-colors
              ${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400'}
            `}
            disabled={!hasChanges}
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
      url: PropTypes.string.isRequired,
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

export default memo(LayerModal);
