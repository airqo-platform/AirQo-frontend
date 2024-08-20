import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';

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

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

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
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {sidebar ? (
          <div className={`relative ${isCollapsed ? 'bottom-14' : ''}`}>
            <div
              className={`${dropdownClass} w-full max-w-56 overflow-x-hidden overflow-y-auto mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-[1000] ${className}`}
            >
              <div className="py-1">{children}</div>
            </div>
          </div>
        ) : (
          <div
            className={`absolute z-50 w-56 mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ${className}`}
          >
            <div className="py-1">{children}</div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default CustomDropdown;
