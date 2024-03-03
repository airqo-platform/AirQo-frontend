import React, { useState, useRef, useEffect } from 'react';
import MapImage from '@/images/map/dd1.png';
import Image from 'next/image';

const mapDetails = [
  {
    name: 'Emoji',
    image: MapImage,
  },
  {
    name: 'Heatmap',
    image: MapImage,
  },
  {
    name: 'Node',
    image: MapImage,
  },
  {
    name: 'Number',
    image: MapImage,
  },
];

const Option = ({ isSelected, children, onSelect, image }) => (
  <button
    onClick={onSelect}
    className={`flex flex-col items-center space-y-3 ${isSelected ? 'border-blue-500' : ''}`}>
    <div
      className={`w-14 h-14 relative rounded-md ${
        isSelected ? 'border-2 border-blue-500 ring-4 ring-light-blue-100' : ''
      }`}>
      <Image src={image} alt={children} layout='fill' objectFit='cover' className='rounded-md' />
    </div>
    <span>{children}</span>
  </button>
);

const LayerModal = ({ isOpen, onClose, mapStyles, onStyleSelect, showSideBar }) => {
  const [selectedStyle, setSelectedStyle] = useState(mapStyles[0]);
  const [selectedMapDetail, setSelectedMapDetail] = useState(mapDetails[0]);
  const modalRef = useRef();

  const handleApply = () => {
    onStyleSelect(selectedStyle);
    onClose();
  };

  const handleSelectStyle = (style) => {
    setSelectedStyle(style);
  };

  const handleSelectDetail = (detail) => {
    setSelectedMapDetail(detail);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  if (!isOpen) return null;

  return (
    <div className='fixed z-10 inset-0 overflow-y-auto z-50'>
      <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div className='absolute inset-0 bg-[#4e4e4e3b]'></div>
        </div>
        <span
          className='hidden sm:inline-block sm:align-middle sm:h-screen'
          aria-hidden='true'></span>
        <div
          ref={modalRef}
          className={`absolute h-auto top-1/2 transform -translate-y-1/2 bg-white rounded-lg overflow-hidden shadow-xl sm:max-w-lg sm:w-full ${
            showSideBar
              ? 'w-[375px] md:max-w-sm md:left-[calc(50%+200px)] transform md:-translate-x-[calc(50%-15px)] lg:-translate-x-[calc(50%-40px)]'
              : 'md:left-[56%] transform md:-translate-x-1/2'
          }`}>
          <div className='p-6 text-left'>
            <h3 className='text-lg font-semibold mb-3'>Map Details</h3>
            <div className='flex justify-between space-x-2'>
              {mapDetails.map((detail) => (
                <Option
                  key={detail.name}
                  isSelected={detail.name === selectedMapDetail.name}
                  onSelect={() => handleSelectDetail(detail)}
                  image={detail.image}>
                  {detail.name}
                </Option>
              ))}
            </div>
            <div className='w-full bg-grey-200 h-[2px] my-2' />
            <h3 className='text-lg font-semibold mb-3'>Map type</h3>
            <div>
              <div className='flex justify-between'>
                {mapStyles.map((style) => (
                  <Option
                    key={style.name}
                    image={style.image}
                    isSelected={style.name === selectedStyle.name}
                    onSelect={() => handleSelectStyle(style)}>
                    {style.name}
                  </Option>
                ))}
              </div>
            </div>
          </div>
          <div className='flex justify-end w-full p-6 space-x-4 bg-[#F9FAFB]'>
            <button onClick={onClose} className='px-4 py-2 border rounded-md'>
              Cancel
            </button>
            <button onClick={handleApply} className='px-4 py-2 bg-blue-600 rounded-md text-white'>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerModal;
