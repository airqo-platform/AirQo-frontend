import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import DatePicker from '@/components/Calendar/DatePicker';
import Calendar from '@/components/Calendar/Calendar';

const formatName = (name, textFormat = 'lowercase') => {
  if (typeof name !== 'string' || !name) return '';
  const formatted = name.replace(/[_-]/g, ' ');
  return textFormat === 'uppercase' ? formatted.toUpperCase() : formatted;
};

const FIELD_FORMAT_RULES = {
  organization: {
    display: (value) => formatName(value || '', 'uppercase'),
    store: (v) => v,
  },
  default: {
    display: (value, textFormat) => formatName(value || '', textFormat),
    store: (value, textFormat) => formatName(value || '', textFormat),
  },
};

const formatFieldValue = (value, fieldId, textFormat, display = false) => {
  const rule = FIELD_FORMAT_RULES[fieldId] || FIELD_FORMAT_RULES.default;
  return display
    ? rule.display(value, textFormat)
    : rule.store(value, textFormat);
};

const CustomFields = ({
  field = false,
  title,
  options = [],
  id,
  icon,
  btnText,
  edit = false,
  useCalendar = false,
  handleOptionSelect,
  defaultOption,
  textFormat = 'lowercase',
  required = false,
  requiredText = '',
  className = '',
  multiSelect = false,
  disabled = false, // Add disabled prop
}) => {
  const prevDefaultRef = useRef(null);

  const normalize = useCallback(
    (val) =>
      multiSelect
        ? (Array.isArray(val) ? val : [val]).filter(Boolean)
        : val || { id: '', name: '' },
    [multiSelect],
  );

  const [selected, setSelected] = useState(() =>
    normalize(defaultOption || options[0]),
  );

  useEffect(() => {
    if (!defaultOption) return;
    const cur = JSON.stringify(defaultOption);
    const prev = JSON.stringify(prevDefaultRef.current);
    if (cur !== prev) {
      setSelected(normalize(defaultOption));
      prevDefaultRef.current = defaultOption;
    }
  }, [defaultOption, multiSelect, normalize]);

  const handleSelect = useCallback(
    (option) => {
      if (id === 'duration') {
        setSelected(option);
        handleOptionSelect(id, option);
        return;
      }

      if (multiSelect) {
        setSelected((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          const exists = list.find((p) => p.id === option.id);

          // Prevent deselecting if it's the last selected item
          if (exists && list.length === 1) {
            return list;
          }

          const next = exists
            ? list.filter((p) => p.id !== option.id)
            : [...list, option];
          handleOptionSelect(id, next);
          return next;
        });
        return;
      }

      const single = {
        ...option,
        name: formatFieldValue(option.name, id, textFormat),
      };
      setSelected(single);
      handleOptionSelect(id, single);
    },
    [id, handleOptionSelect, textFormat, multiSelect],
  );

  const displayText = (() => {
    if (btnText) return formatName(btnText, textFormat);
    if (multiSelect) {
      const list = Array.isArray(selected) ? selected : [selected];
      return list
        .map((o) => formatFieldValue(o?.name || '', id, textFormat, true))
        .join(', ');
    }
    return formatFieldValue(selected?.name || '', id, textFormat, true);
  })();

  const isActive = (opt) =>
    multiSelect
      ? Array.isArray(selected) && selected.some((p) => p.id === opt.id)
      : selected?.id === opt.id;

  const CheckboxIcon = ({ checked, disabled }) => (
    <div
      className={`
      w-4 h-4 border-2 rounded flex items-center justify-center transition-colors
      ${checked ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}
      ${disabled ? 'opacity-50' : ''}
    `}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  // Responsive calendar logic
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Fix: Prevent event bubbling for calendar actions
  const handleCalendarButtonClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCalendarDialog(true);
  }, []);

  const handleCalendarChange = useCallback(
    (range) => {
      setSelected({ id: 'calendar', name: range });
      handleOptionSelect(id, { id: 'calendar', name: range });
      // Only close if both start and end dates are selected
      if (range.start && range.end) {
        setShowCalendarDialog(false);
      }
    },
    [handleOptionSelect, id],
  );

  const handleCalendarClose = useCallback(() => {
    setShowCalendarDialog(false);
  }, []);

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col">
        <label className="w-[280px] text-[#7A7F87] flex items-center">
          {title}
          {required && <span className="text-red-500 ml-1 font-medium">*</span>}
        </label>
        {required && requiredText && (
          <span className="text-xs text-red-500 mt-0.5">{requiredText}</span>
        )}
      </div>

      {field ? (
        <input
          type="text"
          name={id}
          className="bg-transparent text-base font-medium w-full border-none p-0 m-0"
          value={formatFieldValue(selected?.name || '', id, textFormat, true)}
          onChange={(e) =>
            handleSelect({ ...(selected || {}), name: e.target.value })
          }
          disabled={!edit}
          required={required}
          aria-required={required}
        />
      ) : useCalendar ? (
        isLargeScreen ? (
          <>
            <button
              type="button"
              className="w-full px-3 py-2 shadow text-left border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
              onClick={handleCalendarButtonClick}
            >
              {selected?.name?.start && selected?.name?.end
                ? `${selected.name.start ? new Date(selected.name.start).toLocaleDateString() : ''} - ${selected.name.end ? new Date(selected.name.end).toLocaleDateString() : ''}`
                : 'Select Date Range'}
            </button>
            {showCalendarDialog && (
              <div
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-10"
                onClick={(e) => {
                  // Only close if clicking the backdrop, not the calendar
                  if (e.target === e.currentTarget) {
                    handleCalendarClose();
                  }
                }}
              >
                <div
                  className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Calendar
                    showTwoCalendars={true}
                    handleValueChange={handleCalendarChange}
                    closeDatePicker={handleCalendarClose}
                    enableTimePicker
                    initialMonth1={
                      selected?.name?.start
                        ? new Date(selected.name.start)
                        : null
                    }
                    // initialMonth2={
                    //   selected?.name?.end ? new Date(selected.name.end) : null
                    // }
                    initialValue={selected?.name}
                    showTimePickerToggle
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <DatePicker
            onChange={handleSelect}
            mobileCollapse
            calendarXPosition="relative"
            initialValue={selected}
            required={required}
            aria-required={required}
            className={required && !selected?.name ? 'border-red-300' : ''}
          />
        )
      ) : (
        <div className="w-full relative">
          <CustomDropdown
            text={displayText}
            icon={icon}
            iconPosition="left"
            className="w-full"
            buttonClassName="w-full bg-white px-3 py-2 text-left"
            menuClassName="w-full"
            dropdownAlign="left"
            disableMobileCollapse
            disabled={
              disabled || // Use the disabled prop
              (!edit &&
                options.length > 0 &&
                ![
                  'dataType',
                  'organization',
                  'pollutant',
                  'frequency',
                  'fileType',
                  'deviceCategory', // Add deviceCategory to allowed fields
                ].includes(id))
            }
          >
            {options.map((opt) => {
              const checked = isActive(opt);
              const isOnlySelected =
                multiSelect &&
                Array.isArray(selected) &&
                selected.length === 1 &&
                checked;
              return (
                <DropdownItem
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  active={!multiSelect && checked}
                  className={multiSelect ? 'hover:bg-transparent' : ''}
                >
                  <div
                    className={`
                    flex items-center gap-3 w-full py-1
                    ${multiSelect ? 'cursor-pointer' : ''}
                  `}
                  >
                    {multiSelect && (
                      <CheckboxIcon
                        checked={checked}
                        disabled={isOnlySelected}
                      />
                    )}
                    <span
                      className={`
                      flex-1 text-sm
                      ${checked && multiSelect ? 'font-medium' : 'text-gray-700'}
                      ${isOnlySelected ? 'opacity-50' : ''}
                    `}
                    >
                      {formatName(opt.name, textFormat)}
                    </span>
                  </div>
                </DropdownItem>
              );
            })}
          </CustomDropdown>
        </div>
      )}
    </div>
  );
};

CustomFields.propTypes = {
  field: PropTypes.bool,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }),
  ),
  id: PropTypes.string.isRequired,
  icon: PropTypes.node,
  btnText: PropTypes.string,
  edit: PropTypes.bool,
  useCalendar: PropTypes.bool,
  handleOptionSelect: PropTypes.func.isRequired,
  defaultOption: PropTypes.oneOfType([
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      }),
    ),
  ]),
  textFormat: PropTypes.oneOf(['uppercase', 'lowercase']),
  required: PropTypes.bool,
  requiredText: PropTypes.string,
  className: PropTypes.string,
  multiSelect: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CustomFields;
