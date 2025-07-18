import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import DatePicker from '@/components/Calendar/DatePicker';

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
}) => {
  const prevDefaultRef = useRef(null);

  const normalize = (val) =>
    multiSelect
      ? (Array.isArray(val) ? val : [val]).filter(Boolean)
      : val || { id: '', name: '' };

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
  }, [defaultOption, multiSelect]);

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
        <DatePicker
          onChange={handleSelect}
          mobileCollapse
          calendarXPosition="relative right-[18px]"
          initialValue={selected}
          required={required}
          aria-required={required}
          className={required && !selected?.name ? 'border-red-300' : ''}
        />
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
              !edit &&
              options.length > 0 &&
              ![
                'dataType',
                'organization',
                'pollutant',
                'frequency',
                'fileType',
              ].includes(id)
            }
          >
            {options.map((opt) => (
              <DropdownItem
                key={opt.id}
                onClick={() => handleSelect(opt)}
                active={isActive(opt)}
              >
                {formatName(opt.name, textFormat)}
              </DropdownItem>
            ))}
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
};

export default CustomFields;
