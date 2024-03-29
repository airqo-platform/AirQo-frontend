import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = ({
  trigger,
  children,
  className,
  id,
  dropdownWidth = '200px',
  openDropdown = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(openDropdown);
    // console.log(openDropdown)
  }, [openDropdown]);

  return (
    <div ref={dropdownRef} className='relative' id={id}>
      {React.cloneElement(trigger, { onClick: handleDropdown })}
      {isOpen && (
        <div
          className={`absolute mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-[10000] ${className}`}
          style={{
            width: dropdownWidth,
          }}
        >
          <div className='py-1'>{children}</div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
