import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '../../../Dropdowns/CustomDropdown';
import DatePicker from '../../../Calendar/DatePicker';

/**
 * Formats a string by replacing underscores/hyphens with spaces and adjusting its case.
 */
const formatName = (name, textFormat = 'lowercase') => {
  if (typeof name !== 'string' || !name) return name;
  const formatted = name.replace(/[_-]/g, ' ');
  return textFormat === 'uppercase' ? formatted.toUpperCase() : formatted;
};

const FIELD_FORMAT_RULES = {
  organization: {
    display: (value) => {
      // Fallback to an empty string if `value` is null or undefined
      const safeValue = typeof value === 'string' ? value : '';
      return formatName(safeValue.replace(/[_-]/g, ' '), 'uppercase');
    },
    store: (value) => value,
  },
  default: {
    display: (value, textFormat) => {
      // Fallback to an empty string if `value` is null or undefined
      const safeValue = typeof value === 'string' ? value : '';
      return formatName(safeValue, textFormat);
    },
    store: (value, textFormat) => {
      // Same logic here if you need to ensure `value` is a string
      const safeValue = typeof value === 'string' ? value : '';
      return formatName(safeValue, textFormat);
    },
  },
};

const formatFieldValue = (value, fieldId, textFormat, display = false) => {
  const rules = FIELD_FORMAT_RULES[fieldId] || FIELD_FORMAT_RULES.default;
  return display
    ? rules.display(value, textFormat)
    : rules.store(value, textFormat);
};

/**
 * CustomFields Component
 * Renders different types of input fields based on the props.
 */
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
}) => {
  // Use a ref to prevent unnecessary rerenders due to defaultOption changes
  const prevDefaultOptionRef = useRef(null);

  const initialOption =
    defaultOption || (options.length > 0 ? options[0] : { id: '', name: '' });
  const [selectedOption, setSelectedOption] = useState(initialOption);

  // Update selectedOption when defaultOption changes
  // Use JSON.stringify for deep comparison to prevent infinite loops
  useEffect(() => {
    if (!defaultOption) return;

    const currentOptionStr = JSON.stringify(defaultOption);
    const prevOptionStr = JSON.stringify(prevDefaultOptionRef.current);

    if (currentOptionStr !== prevOptionStr) {
      setSelectedOption(defaultOption);
      prevDefaultOptionRef.current = defaultOption;
    }
  }, [defaultOption]);

  const handleSelect = useCallback(
    (option) => {
      // Special handling for calendar dates
      if (id === 'duration') {
        setSelectedOption(option);
        handleOptionSelect(id, option);
        return;
      }

      // Normal handling for other fields
      const formattedOption = {
        ...option,
        name: formatFieldValue(option.name, id, textFormat),
      };
      setSelectedOption(formattedOption);
      handleOptionSelect(id, formattedOption);
    },
    [id, handleOptionSelect, textFormat],
  );

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="w-[280px] text-[#7A7F87]">{title}</label>
      {field ? (
        <input
          type="text"
          name={id}
          className="bg-transparent text-[16px] font-medium leading-6 w-full border-none p-0 m-0"
          value={formatFieldValue(selectedOption.name, id, textFormat, true)}
          onChange={(e) =>
            handleSelect({ ...selectedOption, name: e.target.value })
          }
          disabled={!edit}
        />
      ) : useCalendar ? (
        <DatePicker
          customPopperStyle={{ left: '-7px' }}
          onChange={(dates) => {
            handleSelect(dates);
          }}
          initialValue={selectedOption}
        />
      ) : (
        <CustomDropdown
          tabID={id}
          isField={false}
          tabStyle="w-full bg-white px-3 py-2"
          dropdown
          tabIcon={icon}
          btnText={
            btnText
              ? formatName(btnText, textFormat)
              : formatFieldValue(selectedOption.name, id, textFormat, true)
          }
          customPopperStyle={{ left: '-7px' }}
          dropDownClass="w-full"
          textFormat={textFormat}
        >
          {options.map((option) => (
            <span
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                selectedOption.id === option.id ? 'bg-[#EBF5FF] rounded-md' : ''
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{formatName(option.name, textFormat)}</span>
              </span>
              {selectedOption.id === option.id && <CheckIcon fill="#145FFF" />}
            </span>
          ))}
        </CustomDropdown>
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
  defaultOption: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  textFormat: PropTypes.oneOf(['uppercase', 'lowercase']),
};

export default CustomFields;
