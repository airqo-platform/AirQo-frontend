import React, { useState, useEffect, useRef } from 'react';
import CalendarIcon from '@/icons/Analytics/calendarIcon';
import TabButtons from '../Button/TabButtons';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import Calendar from './Calendar';

const DatePicker = ({ customPopperStyle, alignment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const popperRef = useRef(null);
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
          boundary: 'clippingParents',
          rootBoundary: 'document',
          padding: 8,
        },
      },
      {
        name: 'flip',
        options: {
          boundary: 'clippingParents',
          rootBoundary: 'document',
          padding: 8,
        },
      },
    ],
  });

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleValueChange = (newValue) => {
    console.log(newValue);
  };

  const handleClickOutside = (event) => {
    if (
      popperRef.current &&
      !popperRef.current.contains(event.target) &&
      !referenceElement.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, referenceElement]);

  return (
    <div>
      <TabButtons
        Icon={<CalendarIcon />}
        btnText={'set date'}
        tabButtonClass="w-full "
        dropdown
        onClick={handleClick}
        id="datePicker"
        type={'button'}
        btnStyle={'w-full bg-white border-grey-750 px-4 py-2'}
        tabRef={setReferenceElement}
      />
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
        <div
          ref={(node) => {
            setPopperElement(node);
            popperRef.current = node;
          }}
          style={{
            ...styles.popper,
            ...customPopperStyle,
          }}
          {...attributes.popper}
        >
          <Calendar
            showTwoCalendars={false}
            initialMonth1={new Date(new Date().getFullYear(), new Date().getMonth() - 1)}
            initialMonth2={new Date()}
            handleValueChange={(newValue) => {
              handleValueChange(newValue);
            }}
            closeDatePicker={() => setIsOpen(false)}
          />
        </div>
      </Transition>
    </div>
  );
};

export default DatePicker;
