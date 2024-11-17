import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '../../../Dropdowns/CustomDropdown';
import DatePicker from '../../../Calendar/DatePicker';

const formatName = (name) => {
  if (name.toLowerCase() === 'airqo') {
    return 'AirQo';
  }
  return name;
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
}) => {
  const [selectedOption, setSelectedOption] = useState(
    defaultOption || options[0],
  );

  const handleSelect = useCallback(
    (option) => {
      const formattedOption = {
        ...option,
        name: formatName(option.name),
      };
      setSelectedOption(formattedOption);
      handleOptionSelect(id, formattedOption);
    },
    [id, handleOptionSelect],
  );

  return (
    <div className="w-full h-auto flex flex-col gap-2 justify-start">
      <label className="w-[280px] h-auto p-0 m-0 text-[#7A7F87]">{title}</label>
      {field ? (
        <input
          className="bg-transparent text-[16px] font-medium leading-6 p-0 m-0 w-full h-auto border-none"
          value={formatName(selectedOption.name)}
          onChange={(e) => handleSelect({ name: e.target.value })}
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
          tabStyle="w-full bg-white px-3 py-2"
          dropdown
          tabIcon={icon}
          btnText={btnText || formatName(selectedOption.name)}
          customPopperStyle={{ left: '-7px' }}
          dropDownClass="w-full"
        >
          {options.map((option) => (
            <span
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                selectedOption.id === option.id ? 'bg-[#EBF5FF] rounded-md' : ''
              }`}
            >
              <span className="flex items-center capitalize space-x-2">
                <span>{formatName(option.name)}</span>
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
  title: PropTypes.string,
  options: PropTypes.array,
  id: PropTypes.string,
  icon: PropTypes.node,
  btnText: PropTypes.string,
  edit: PropTypes.bool,
  useCalendar: PropTypes.bool,
  handleOptionSelect: PropTypes.func,
  defaultOption: PropTypes.object,
};

export default CustomFields;
