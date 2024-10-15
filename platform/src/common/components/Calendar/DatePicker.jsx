// DatePicker.js
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { format, subMonths } from 'date-fns';
import { usePopper } from 'react-popper';
import { Transition } from '@headlessui/react';
import Calendar from './Calendar';
import CalendarIcon from '@/icons/Analytics/calendarIcon';
import TabButtons from '../Button/TabButtons';

/**
 * DatePicker component integrates the Calendar and manages its visibility.
 */
const DatePicker = ({ customPopperStyle, alignment, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [selectedDate, setSelectedDate] = useState({ start: null, end: null });
  const popperRef = useRef(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: alignment === 'right' ? 'bottom-end' : 'bottom-start',
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      {
        name: 'preventOverflow',
        options: { boundary: 'viewport', padding: 8 },
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
      { name: 'computeStyles', options: { adaptive: false } },
      { name: 'eventListeners', options: { scroll: true, resize: true } },
      { name: 'arrow', options: { padding: 8 } },
    ],
  });

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleValueChange = (newValue) => {
    setSelectedDate(newValue);
    onChange(newValue);
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

  const formattedStartDate = selectedDate.start
    ? format(selectedDate.start, 'MMM d, yyyy')
    : '';
  const formattedEndDate = selectedDate.end
    ? format(selectedDate.end, 'MMM d, yyyy')
    : '';
  const btnText =
    selectedDate.start && selectedDate.end
      ? `${formattedStartDate} - ${formattedEndDate}`
      : 'Select Date Range';

  return (
    <div className="relative">
      <TabButtons
        Icon={<CalendarIcon />}
        btnText={btnText}
        tabButtonClass="w-full"
        dropdown
        onClick={handleToggle}
        id="datePicker"
        type="button"
        btnStyle="w-full bg-white border-gray-750 px-4 py-2"
        tabRef={setReferenceElement}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      />
      <Transition
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        className="absolute z-50"
      >
        <div
          ref={(node) => {
            setPopperElement(node);
            popperRef.current = node;
          }}
          style={{ ...styles.popper, ...customPopperStyle }}
          {...attributes.popper}
        >
          <Calendar
            showTwoCalendars={false}
            initialMonth1={subMonths(new Date(), 1)}
            initialMonth2={new Date()}
            handleValueChange={handleValueChange}
            closeDatePicker={() => setIsOpen(false)}
          />
        </div>
      </Transition>
    </div>
  );
};

DatePicker.propTypes = {
  customPopperStyle: PropTypes.object,
  alignment: PropTypes.oneOf(['left', 'right']),
  onChange: PropTypes.func.isRequired,
};

DatePicker.defaultProps = {
  customPopperStyle: {},
  alignment: 'left',
};

export default DatePicker;
