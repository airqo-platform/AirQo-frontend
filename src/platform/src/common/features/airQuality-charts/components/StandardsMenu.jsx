import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { setAqStandard } from '@/lib/store/services/charts/ChartSlice';
import { IoMdCheckmark } from 'react-icons/io';

const aqStandards = [
  {
    name: 'WHO',
    value: {
      pm2_5: 15,
      pm10: 45,
      no2: 25,
    },
  },
  {
    name: 'NEMA',
    value: {
      pm2_5: 25,
      pm10: 40,
      no2: 10,
    },
  },
];

const StandardsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const selectedStandard = useSelector((state) => state.chart.aqStandard);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Adjust this breakpoint as needed
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelectStandard = (standard) => {
    dispatch(setAqStandard(standard));
    setIsOpen(false);
  };

  const currentStandard =
    aqStandards.find((s) => s.name === selectedStandard?.name) ||
    aqStandards[0];

  return (
    <div
      className="relative w-full border-t border-gray-200"
      ref={menuRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex justify-between text-left items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Air Quality Standards</span>
        <span className="text-gray-400 ml-2 transition-transform duration-200">
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
          absolute bg-white shadow-md p-1 border border-gray-200 rounded-md
          transition-all duration-200 ease-in-out overflow-hidden z-10
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          ${isMobile ? 'left-0 right-0 top-full mt-1' : 'right-full top-0 mt-0'}
        `}
        style={{
          width: '100%',
          transform: isMobile ? 'none' : 'translateX(-8px)',
        }}
      >
        {aqStandards.map((standard, index) => (
          <button
            key={standard.name}
            className={`
              flex flex-row justify-between items-center w-full px-4 py-2 
              text-sm text-gray-600 hover:bg-gray-50
              ${standard.name === currentStandard.name ? 'bg-gray-100' : ''}
              ${index !== 0 ? 'border-t border-gray-200' : ''}
            `}
            onClick={() => handleSelectStandard(standard)}
          >
            <span className="font-medium">{standard.name}</span>
            {standard.name === currentStandard.name && (
              <span className="text-green-500 ml-2">
                <IoMdCheckmark size={18} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StandardsMenu;
