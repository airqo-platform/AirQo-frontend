import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '../../../Dropdowns/CustomDropdown';
import DatePicker from '../../../Calendar/DatePicker';

/**
 * Formats the name by replacing underscores and hyphens with spaces and adjusting case.
 */
const formatName = (name, textFormat = 'lowercase') => {
  if (typeof name !== 'string' || !name) return name;
  const formatted = name.replace(/[_-]/g, ' ');
  return textFormat === 'uppercase' ? formatted.toUpperCase() : formatted;
};

/**
 * Handles the formatting logic for field values.
 * For the "organization" field ID, it retains hyphens in the selected value but displays without hyphens in uppercase.
 */
const formatFieldValue = (value, fieldId, textFormat, display = false) => {
  if (fieldId === 'organization') {
    return display ? formatName(value, 'uppercase') : value;
  }
  return formatName(value, textFormat);
};

/**
 * CustomFields Component
 * Renders different types of input fields based on props.
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
  const [selectedOption, setSelectedOption] = useState(
    defaultOption || (options.length > 0 ? options[0] : { id: '', name: '' }),
  );

  /**
   * Handles the selection of an option.
   */
  const handleSelect = useCallback(
    (option) => {
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
    <div className="w-full h-auto flex flex-col gap-2 justify-start">
      <label className="w-[280px] h-auto p-0 m-0 text-[#7A7F87]">{title}</label>

      {field ? (
        <input
          className="bg-transparent text-[16px] font-medium leading-6 p-0 m-0 w-full h-auto border-none"
          value={formatFieldValue(selectedOption.name, id, textFormat, true)}
          onChange={(e) =>
            handleSelect({ ...selectedOption, name: e.target.value })
          }
          type="text"
          name={id}
          disabled={!edit}
        />
      ) : useCalendar ? (
        <DatePicker
          customPopperStyle={{ left: '-7px' }}
          onChange={(date) => {
            handleSelect({ name: date });
          }}
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
              {selectedOption.id === option.id && (
                <CheckIcon fill={'#145FFF'} />
              )}
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
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
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
    name: PropTypes.string,
  }),
  textFormat: PropTypes.oneOf(['uppercase', 'lowercase']),
};

export default CustomFields;
