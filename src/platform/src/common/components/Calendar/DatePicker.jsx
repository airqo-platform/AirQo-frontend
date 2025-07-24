import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { usePopper } from 'react-popper';
import { Transition } from '@headlessui/react';
import Calendar from './Calendar';
import CalendarIcon from '@/icons/Analytics/calendarIcon';
import CustomDropdown from '../Button/CustomDropdown';

/**
 * DatePicker component that integrates Calendar with react-popper.
 * It manages its open/close state and renders the calendar in a popper with an arrow.
 */
const DatePicker = ({
  customPopperStyle = {},
  alignment = 'left',
  onChange,
  initialValue = null,
  className = '',
  required = false,
  mobileCollapse,
  calendarXPosition = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const containerRef = useRef(null); // Ref for the main DatePicker container

  // Use ref to track previous initialValue to prevent unnecessary state updates
  const prevInitialValueRef = useRef(null);

  // Initialize with provided initialValue if available
  const [selectedDate, setSelectedDate] = useState({
    start: initialValue?.name?.start || null,
    end: initialValue?.name?.end || null,
  });

  // Configure react-popper
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
            element: arrowElement,
            padding: 8,
          },
        },
      ],
    },
  );

  /**
   * Toggles the calendar's open/close state.
   */
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
    // Request popper update when opening to ensure correct positioning
    if (!isOpen && update) {
      setTimeout(update, 10);
    }
  }, [isOpen, update]);

  /**
   * Called whenever the user selects a date range in the Calendar.
   * Formats the date structure to match what CustomFields expects.
   */
  const handleValueChange = useCallback(
    (newValue) => {
      // Update local state
      setSelectedDate(newValue);

      // Only trigger onChange if both dates are selected or dates have changed
      if (newValue.start || newValue.end) {
        // Transform the date structure to match what CustomFields expects
        const formattedDates = {
          name: {
            start: newValue.start,
            end: newValue.end,
          },
        };
        onChange?.(formattedDates);
      }

      // Close the calendar after selection is complete
      // Give a slight delay to allow UI to update if needed
      if (newValue.start && newValue.end) {
        setTimeout(() => setIsOpen(false), 300);
      }
    },
    [onChange],
  );

  /**
   * Closes the popper when clicking outside of it.
   */
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

  // Update the selected date if initialValue changes externally
  useEffect(() => {
    if (!initialValue) return;

    // Use a deep comparison for objects to prevent unnecessary re-renders
    const newStart = initialValue?.name?.start || null;
    const newEnd = initialValue?.name?.end || null;

    if (
      newStart !== prevInitialValueRef.current?.start ||
      newEnd !== prevInitialValueRef.current?.end
    ) {
      setSelectedDate({
        start: newStart,
        end: newEnd,
      });

      prevInitialValueRef.current = {
        start: newStart,
        end: newEnd,
      };
    }
  }, [initialValue]);

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
  const getFormattedDateText = useCallback(() => {
    if (!selectedDate.start && !selectedDate.end) {
      return 'Select Date Range';
    }

    const formattedStartDate = selectedDate.start
      ? format(new Date(selectedDate.start), 'MMM d, yyyy')
      : '';

    const formattedEndDate = selectedDate.end
      ? format(new Date(selectedDate.end), 'MMM d, yyyy')
      : '';

    if (selectedDate.start && selectedDate.end) {
      return `${formattedStartDate} - ${formattedEndDate}`;
    } else if (selectedDate.start) {
      return `${formattedStartDate} - Select end date`;
    } else {
      return `Select start date - ${formattedEndDate}`;
    }
  }, [selectedDate]);

  // Get formatted button text
  const btnText = getFormattedDateText();

  // Conditional class for required field styling
  const requiredClass =
    required && !selectedDate.start && !selectedDate.end
      ? 'border-red-300'
      : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div ref={setReferenceElement}>
        <CustomDropdown
          text={btnText}
          icon={<CalendarIcon fill="#536A87" />}
          iconPosition="left"
          onClick={toggleOpen}
          isButton={true}
          disableMobileCollapse={mobileCollapse}
          showArrowWithButton={true}
          buttonClassName={`w-full overflow-hidden bg-white px-4 py-2 ${requiredClass}`}
          className="w-full"
          dropdownAlign={alignment}
        />
      </div>

      {/* Transition for the popper (calendar container) */}
      <Transition
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        as="div"
        ref={(node) => {
          setPopperElement(node);
        }}
        style={{ ...styles.popper, ...customPopperStyle, zIndex: 1000 }}
        {...attributes.popper}
        className="z-50"
      >
        <div className={`${calendarXPosition}`}>
          <div
            ref={setArrowElement}
            style={{
              ...styles.arrow,
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid white', // Default arrow color
              position: 'absolute',
              zIndex: 1,
            }}
            className="dark:border-b-gray-800" // Dark mode arrow color
            {...attributes.arrow}
          />

          {/* Calendar container */}
          <Calendar
            showTwoCalendars={false}
            handleValueChange={handleValueChange}
            initialValue={selectedDate}
            closeDatePicker={() => setIsOpen(false)}
          />
        </div>
      </Transition>
    </div>
  );
};

export default DatePicker;
