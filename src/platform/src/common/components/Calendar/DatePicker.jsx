import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { format, isValid, parseISO } from 'date-fns';
import { usePopper } from 'react-popper';
import { Transition } from '@headlessui/react';
import Calendar from './Calendar';
import CalendarIcon from '@/icons/Analytics/calendarIcon';
import CustomDropdown from '../Button/CustomDropdown';

const DatePicker = ({
  customPopperStyle = {},
  alignment = 'left',
  onChange,
  initialValue = null,
  className = '',
  required = false,
  mobileCollapse,
  calendarXPosition = '',
  enableTimePicker = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const containerRef = useRef(null);
  const prevInitialValueRef = useRef({
    start: null,
    end: null,
    startTime: null,
    endTime: null,
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const startRaw = initialValue?.name?.start;
    const endRaw = initialValue?.name?.end;
    const startTimeRaw = enableTimePicker
      ? initialValue?.name?.startTime
      : null;
    const endTimeRaw = enableTimePicker ? initialValue?.name?.endTime : null;

    const parseDate = (date) => {
      if (!date) return null;
      const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
      return isValid(parsed) ? parsed : null;
    };

    const start = parseDate(startRaw);
    const end = parseDate(endRaw);
    const startTime = parseDate(startTimeRaw);
    const endTime = parseDate(endTimeRaw);

    return { start, end, startTime, endTime };
  });

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
        { name: 'arrow', options: { element: arrowElement, padding: 8 } },
      ],
    },
  );

  const toggleOpen = useCallback(
    (e) => {
      // Fix: Prevent event bubbling that might trigger form submission
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsOpen((prev) => !prev);
      if (!isOpen && update) setTimeout(update, 10);
    },
    [isOpen, update],
  );

  const handleValueChange = useCallback(
    (newValue) => {
      setSelectedDate(newValue);
      if (newValue.start || newValue.end) {
        onChange?.({ name: newValue });
      }
      // Fix: Only close calendar when both dates are selected
      if (newValue.start && newValue.end) {
        setTimeout(() => setIsOpen(false), 100);
      }
    },
    [onChange],
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
    if (!initialValue) return;
    const newStartRaw = initialValue?.name?.start;
    const newEndRaw = initialValue?.name?.end;
    const newStartTimeRaw = enableTimePicker
      ? initialValue?.name?.startTime
      : null;
    const newEndTimeRaw = enableTimePicker ? initialValue?.name?.endTime : null;

    const parseDate = (date) => {
      if (!date) return null;
      const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
      return isValid(parsed) ? parsed : null;
    };

    const newStart = parseDate(newStartRaw);
    const newEnd = parseDate(newEndRaw);
    const newStartTime = parseDate(newStartTimeRaw);
    const newEndTime = parseDate(newEndTimeRaw);

    const hasChanged =
      newStart?.getTime() !== prevInitialValueRef.current.start?.getTime() ||
      newEnd?.getTime() !== prevInitialValueRef.current.end?.getTime() ||
      (enableTimePicker &&
        (newStartTime?.getTime() !==
          prevInitialValueRef.current.startTime?.getTime() ||
          newEndTime?.getTime() !==
            prevInitialValueRef.current.endTime?.getTime()));

    if (hasChanged) {
      setSelectedDate({
        start: newStart,
        end: newEnd,
        startTime: newStartTime,
        endTime: newEndTime,
      });
      prevInitialValueRef.current = {
        start: newStart,
        end: newEnd,
        startTime: newStartTime,
        endTime: newEndTime,
      };
    }
  }, [initialValue, enableTimePicker]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const getFormattedDateText = useCallback(() => {
    if (!selectedDate.start && !selectedDate.end) return 'Select Date Range';
    const startDateStr = selectedDate.start
      ? format(selectedDate.start, 'MMM d, yyyy')
      : '';
    const endDateStr = selectedDate.end
      ? format(selectedDate.end, 'MMM d, yyyy')
      : '';
    let datePart = '';
    if (selectedDate.start && selectedDate.end) {
      datePart = `${startDateStr} - ${endDateStr}`;
    } else if (selectedDate.start) {
      datePart = `${startDateStr} - Select end date`;
    } else {
      datePart = `Select start date - ${endDateStr}`;
    }

    if (enableTimePicker) {
      const formatTime = (date) => (date ? format(date, 'HH:mm') : '--:--');
      const startTimeStr = selectedDate.startTime
        ? formatTime(selectedDate.startTime)
        : selectedDate.start
          ? '00:00'
          : '--:--';
      const endTimeStr = selectedDate.endTime
        ? formatTime(selectedDate.endTime)
        : selectedDate.end
          ? '23:59'
          : '--:--';
      let timePart = '';
      if (selectedDate.start && selectedDate.end) {
        timePart = `${startTimeStr} - ${endTimeStr}`;
      } else if (selectedDate.start) {
        timePart = `${startTimeStr} - --:--`;
      } else if (selectedDate.end) {
        timePart = `--:-- - ${endTimeStr}`;
      }
      if (timePart) return `${datePart} ${timePart}`;
    }
    return datePart;
  }, [selectedDate, enableTimePicker]);

  const btnText = useMemo(() => getFormattedDateText(), [getFormattedDateText]);
  const requiredClass =
    required && !selectedDate.start && !selectedDate.end
      ? 'border-red-300'
      : '';

  // Fix: Handle calendar close properly
  const handleCalendarClose = useCallback(() => {
    setIsOpen(false);
  }, []);

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
      <Transition
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        as="div"
        ref={setPopperElement}
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
              borderBottom: '6px solid white',
              position: 'absolute',
              zIndex: 1,
            }}
            className="dark:border-b-gray-800"
            {...attributes.arrow}
          />
          <Calendar
            showTwoCalendars={false}
            handleValueChange={handleValueChange}
            initialValue={selectedDate}
            closeDatePicker={handleCalendarClose}
            enableTimePicker={enableTimePicker}
          />
        </div>
      </Transition>
    </div>
  );
};

DatePicker.propTypes = {
  customPopperStyle: PropTypes.object,
  alignment: PropTypes.oneOf(['left', 'right']),
  onChange: PropTypes.func,
  initialValue: PropTypes.shape({
    name: PropTypes.shape({
      start: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      startTime: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      endTime: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
    }),
  }),
  className: PropTypes.string,
  required: PropTypes.bool,
  mobileCollapse: PropTypes.bool,
  calendarXPosition: PropTypes.string,
  enableTimePicker: PropTypes.bool,
};

export default DatePicker;
