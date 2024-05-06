import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const CustomDropdown = ({
  trigger,
  children,
  className,
  id,
  dropdownWidth = '200px',
  openDropdown = false,
}) => {
  const [isOpen, setIsOpen] = useState(openDropdown);
  const dropdownRef = useRef(null);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(openDropdown);
  }, [openDropdown]);

  const handleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const dropdownClass = isCollapsed ? 'fixed left-24' : 'absolute';

  return (
    <div ref={dropdownRef} className='relative' id={id}>
      {React.cloneElement(trigger, { onClick: handleDropdown })}
      {isOpen && (
        <div className={`relative ${isCollapsed ? 'bottom-20' : ''}`}>
          <div
            className={`${dropdownClass} mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-50 ${className}`}
            style={{ width: dropdownWidth }}>
            <div className='py-1'>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
