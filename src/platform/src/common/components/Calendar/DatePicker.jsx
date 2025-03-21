import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { usePopper } from 'react-popper';
import { Transition } from '@headlessui/react';
import Calendar from './Calendar';
import CalendarIcon from '@/icons/Analytics/calendarIcon';
import TabButtons from '../Button/TabButtons';

/**
 * DatePicker component that integrates Calendar with react-popper.
 * It manages its open/close state and renders the calendar in a popper with an arrow.
 */
const DatePicker = ({
  customPopperStyle = {},
  alignment = 'left',
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);

  const [selectedDate, setSelectedDate] = useState({ start: null, end: null });
  const popperRef = useRef(null);

  // Configure react-popper
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
      {
        name: 'arrow',
        options: {
          element: arrowElement, // attach arrow element
          padding: 8,
        },
      },
    ],
  });

  /**
   * Toggles the calendar's open/close state.
   */
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Called whenever the user selects a date range in the Calendar.
   */
  const handleValueChange = useCallback(
    (newValue) => {
      setSelectedDate(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  /**
   * Closes the popper when clicking outside of it.
   */
  const handleClickOutside = useCallback(
    (event) => {
      if (
        popperRef.current &&
        !popperRef.current.contains(event.target) &&
        referenceElement &&
        !referenceElement.contains(event.target)
      ) {
        setIsOpen(false);
      }
    },
    [referenceElement],
  );

  // Attach/detach outside click handler
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  // Format the selected date range for display
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
      {/* The button that toggles the calendar */}
      <TabButtons
        Icon={<CalendarIcon />}
        btnText={btnText}
        tabButtonClass="w-full"
        dropdown
        onClick={toggleOpen}
        id="datePicker"
        type="button"
        btnStyle="w-full bg-white border-gray-750 px-4 py-2"
        tabRef={setReferenceElement}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      />

      {/* Transition for the popper (calendar container) */}
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
          ref={(node) => {
            setPopperElement(node);
            popperRef.current = node;
          }}
          style={{ ...styles.popper, ...customPopperStyle }}
          {...attributes.popper}
          className="z-50"
        >
          {/* The arrow element for popper */}
          <div
            ref={setArrowElement}
            style={{
              ...styles.arrow,
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid white',
              position: 'absolute',
            }}
            {...attributes.arrow}
          />
          {/* Calendar container with reduced height */}

          <Calendar
            showTwoCalendars={false}
            handleValueChange={handleValueChange}
            closeDatePicker={() => setIsOpen(false)}
          />
        </div>
      </Transition>
    </div>
  );
};

export default DatePicker;
