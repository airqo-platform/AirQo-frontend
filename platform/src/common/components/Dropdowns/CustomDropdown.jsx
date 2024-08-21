'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import TabButtons from '@/components/Button/TabButtons';

const CustomDropdown = ({
  tabButtonClass,
  btnText,
  dropdown,
  tabIcon,
  tabStyle,
  tabID,
  children,
  dropDownClass,
  id,
  openDropdown = false,
  sidebar = false,
  trigger = false,
  alignment = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(openDropdown);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: alignment === 'right' ? 'bottom-end' : 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
          padding: 8,
        },
      },
      {
        name: 'flip',
        options: {
          boundary: 'viewport',
          padding: 8,
        },
      },
    ],
  });
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const handleClickOutside = useCallback(
    (event) => {
      if (popperElement && !popperElement.contains(event.target)) {
        setIsOpen(false);
      }
    },
    [popperElement]
  );

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
    <div className="relative" id={id}>
      {trigger ? (
        <div>
          {React.cloneElement(trigger, {
            onClick: handleDropdown,
          })}
        </div>
      ) : (
        <TabButtons
          tabButtonClass={tabButtonClass}
          tabRef={setReferenceElement}
          onClick={handleDropdown}
          btnStyle={tabStyle}
          btnText={btnText}
          dropdown={dropdown}
          Icon={tabIcon}
          id={tabID}
        />
      )}
      <Transition
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        className="relative"
      >
        {sidebar ? (
          <div className={`relative ${isCollapsed ? 'bottom-14' : ''}`}>
            <div
              ref={setPopperElement}
              className={`${dropdownClass} w-full max-w-56 overflow-x-hidden overflow-y-auto mt-2 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-[1000] ${dropDownClass}`}
            >
              <div className="py-1">{children}</div>
            </div>
          </div>
        ) : (
          <div
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
            className={`z-50 w-40 md:w-56 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ${dropDownClass}`}
          >
            <div className="p-1">{children}</div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default CustomDropdown;
