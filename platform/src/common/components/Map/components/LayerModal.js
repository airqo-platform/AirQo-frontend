import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

/**
 * Option component for rendering each selectable option
 */
const Option = ({ isSelected, children, onSelect, image, disabled }) => (
  <button
    onClick={onSelect}
    className={`flex flex-col items-center space-y-3 ${isSelected ? 'border-blue-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={disabled}
  >
    <div
      className={`w-8 h-8 md:w-14 md:h-14 relative rounded-lg ${isSelected ? 'border-2 border-blue-500 ring-4 ring-light-blue-100' : ''} border-2`}
    >
      <Image
        src={image}
        alt={children}
        layout="fill"
        objectFit="cover"
        className="rounded-lg"
        loading="lazy"
      />
    </div>
    <span>{children}</span>
  </button>
);

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

  const handleApply = () => {
    onStyleSelect(selectedStyle);
    onMapDetailsSelect(selectedMapDetail.name);
    onClose();
  };

  const handleSelectStyle = (style) => {
    setSelectedStyle(style);
  };

  const handleSelectDetail = (detail) => {
    setSelectedMapDetail(detail);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-[#4e4e4e3b]"></div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-50 bg-white rounded-lg overflow-hidden shadow-xl sm:max-w-lg sm:w-full"
      >
        <div className="p-4 md:p-6 text-left">
          <h3 className="text-lg font-semibold mb-3">Map Details</h3>
          <div className="flex justify-between space-x-2">
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
          <div className="w-full bg-grey-200 h-[2px] my-2" />
          <h3 className="text-lg font-semibold mb-3">Map type</h3>
          <div className="flex justify-between">
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

// Add PropTypes for the LayerModal component
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
