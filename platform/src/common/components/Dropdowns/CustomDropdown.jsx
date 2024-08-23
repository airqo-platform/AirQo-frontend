'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import TabButtons from '@/components/Button/TabButtons';
import PropTypes from 'prop-types';

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
  customPopperStyle = {},
}) => {
  const [isOpen, setIsOpen] = useState(openDropdown);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const { styles, attributes, update } = usePopper(
    referenceElement,
    popperElement,
    {
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
            fallbackPlacements: [
              'top-start',
              'top-end',
              'bottom-start',
              'bottom-end',
            ],
          },
        },
        {
          name: 'computeStyles',
          options: {
            adaptive: false,
          },
        },

        {
          name: 'eventListeners',
          options: {
            scroll: true,
            resize: true,
          },
        },

        {
          name: 'hide',
        },

        {
          name: 'arrow',
          options: {
            padding: 8,
          },
        },
      ],
    },
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (
        popperElement &&
        !popperElement.contains(event.target) &&
        referenceElement &&
        !referenceElement.contains(event.target)
      ) {
        setIsOpen(false);
      }
    },
    [popperElement, referenceElement],
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

  useEffect(() => {
    if (update) update();
  }, [isOpen, update]);

  const handleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <div className="relative" id={id}>
      {trigger ? (
        <div ref={setReferenceElement}>
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
      >
        <div
          ref={setPopperElement}
          style={{
            ...styles.popper,
            ...customPopperStyle,
            zIndex: 1000,
          }}
          {...attributes.popper}
          className={`min-w-52 w-auto bg-white border border-gray-200 divide-y divide-gray-100 rounded-xl shadow-lg ${dropDownClass}`}
        >
          <div
            className={
              sidebar && isCollapsed ? 'fixed left-24 bottom-14' : 'p-1'
            }
          >
            {children}
          </div>
        </div>
      </Transition>
    </div>
  );
};

CustomDropdown.propTypes = {
  tabButtonClass: PropTypes.string,
  btnText: PropTypes.string,
  dropdown: PropTypes.bool,
  tabIcon: PropTypes.func,
  tabStyle: PropTypes.string,
  tabID: PropTypes.string,
  children: PropTypes.node,
  dropDownClass: PropTypes.string,
  id: PropTypes.string,
  openDropdown: PropTypes.bool,
  sidebar: PropTypes.bool,
  trigger: PropTypes.bool,
  alignment: PropTypes.string,
  customPopperStyle: PropTypes.object,
};

export default CustomDropdown;
