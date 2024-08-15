import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const CustomDropdown = ({
  trigger,
  children,
  className,
  id,
  openDropdown = false,
  sidebar = false,
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
    <div ref={dropdownRef} className="relative" id={id}>
      {React.cloneElement(trigger, { onClick: handleDropdown })}
      {sidebar
        ? isOpen && (
            <div className={`relative ${isCollapsed ? 'bottom-14' : ''}`}>
              <div
                className={`${dropdownClass} w-full max-w-56 overflow-x-hidden overflow-y-auto mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-[1000] ${className}`}
              >
                <div className="py-1">{children}</div>
              </div>
            </div>
          )
        : isOpen && (
            <div
              className={`absolute z-50 w-56 mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ${className}`}
            >
              <div className="py-1">{children}</div>
            </div>
          )}
    </div>
  );
};

export default CustomDropdown;
