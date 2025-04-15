import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { setAqStandard } from '@/lib/store/services/charts/ChartSlice';
import { IoMdCheckmark } from 'react-icons/io';

const aqStandards = [
  {
    name: 'WHO',
    value: { pm2_5: 15, pm10: 45, no2: 25 },
  },
  {
    name: 'NEMA',
    value: { pm2_5: 25, pm10: 40, no2: 10 },
  },
];

const StandardsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const selectedStandard = useSelector((state) => state.chart.aqStandard);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show dropdown when hovering over the container and hide when leaving.
  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  const handleSelectStandard = (standard) => {
    dispatch(setAqStandard(standard));
    setIsOpen(false);
  };

  const currentStandard =
    aqStandards.find((s) => s.name === selectedStandard?.name) ||
    aqStandards[0];

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full border-t border-gray-200 dark:border-gray-700"
    >
      <button
        className="flex justify-between text-left items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Air Quality Standards</span>
        <span className="ml-2 transition-transform duration-200">
          {isMobile ? (
            <MdKeyboardArrowDown
              size={18}
              className={`transform ${isOpen ? 'rotate-180' : ''}`}
            />
          ) : (
            <MdKeyboardArrowRight
              size={18}
              className={`transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </span>
      </button>
      <div
        className={`
          absolute z-10 transition-all duration-200 ease-in-out overflow-hidden w-full
          ${isMobile ? 'left-0 right-0 top-full mt-1' : 'right-full top-0 mt-0'}
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          bg-white dark:bg-[#1d1f20] border border-gray-200 dark:border-gray-700 rounded-md p-1
        `}
        style={{ transform: isMobile ? 'none' : 'translateX(-8px)' }}
      >
        {aqStandards.map((standard, index) => (
          <button
            key={standard.name}
            onClick={() => handleSelectStandard(standard)}
            className={`
              flex justify-between items-center w-full px-4 py-2 text-sm
              text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
              ${standard.name === currentStandard.name ? 'bg-gray-100 dark:bg-gray-700' : ''}
              ${index !== 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}
            `}
          >
            <span className="font-medium">{standard.name}</span>
            {standard.name === currentStandard.name && (
              <IoMdCheckmark
                size={18}
                className="ml-2 text-green-500 dark:text-green-400"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StandardsMenu;
