'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import TabButtons from '@/components/Button/TabButtons';
import Card from '../CardWrapper';

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
  trigger = null,
  alignment = 'left',
  customPopperStyle = {},
  isField,
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
        { name: 'offset', options: { offset: [0, 8] } },
        {
          name: 'preventOverflow',
          options: { boundary: 'viewport', padding: 8 },
        },
        { name: 'flip', options: { fallbackPlacements: ['top', 'bottom'] } },
        { name: 'computeStyles', options: { adaptive: false } },
        { name: 'eventListeners', options: { scroll: true, resize: true } },
      ],
    },
  );

  // Closes the dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Closes dropdown when clicking outside the dropdown and its trigger
  const handleClickOutside = useCallback(
    (event) => {
      if (
        popperElement &&
        !popperElement.contains(event.target) &&
        referenceElement &&
        !referenceElement.contains(event.target)
      ) {
        closeDropdown();
      }
    },
    [popperElement, referenceElement, closeDropdown],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    setIsOpen(openDropdown);
  }, [openDropdown]);

  useEffect(() => {
    if (update) update();
  }, [isOpen, update]);

  const handleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  // Wraps each dropdown item so that clicking the item triggers its own callback (if any) and closes the dropdown
  const handleItemClick = useCallback(
    (callback) => {
      if (callback) callback();
      closeDropdown();
    },
    [closeDropdown],
  );

  return (
    <div className="relative" id={id}>
      {trigger ? (
        <div ref={setReferenceElement} onClick={handleDropdown}>
          {/* Clone the trigger element and attach the onClick */}
          {React.cloneElement(trigger, { onClick: handleDropdown })}
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
          isField={isField}
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
        <Card
          ref={setPopperElement}
          padding="p-0"
          radius="rounded-xl"
          shadow="shadow-lg"
          width="w-auto"
          className={`
            ${dropDownClass} 
            ${
              sidebar && isCollapsed
                ? 'fixed left-24 top-20 max-w-[220px]'
                : 'min-w-52'
            }
          `}
          // We pass our custom styles only when the sidebar is not collapsed
          {...(sidebar && isCollapsed
            ? {}
            : {
                style: { ...styles.popper, ...customPopperStyle, zIndex: 1000 },
              })}
          {...(sidebar && isCollapsed ? {} : attributes.popper)}
          // Pass custom padding to the Card's content wrapper via contentClassName
          contentClassName="p-1"
        >
          {/* Wrapping the dropdown items in an extra div to handle clicks on empty areas */}
          <div onClick={() => handleItemClick()}>
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onClick: () => handleItemClick(child.props.onClick),
              }),
            )}
          </div>
        </Card>
      </Transition>
    </div>
  );
};

export default React.memo(CustomDropdown);
