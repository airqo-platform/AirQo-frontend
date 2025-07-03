import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePopper } from 'react-popper';

/**
 * SelectField Component (Refactored to mimic SelectDropdown design)
 * Renders a custom select dropdown with an optional label and error message.
 * Props:
 * - label: Optional label text
 * - error: Optional error message
 * - description: Optional description text
 * - containerClassName: Additional classes for the container
 * - className: Additional classes for the select button (now)
 * - listClassName: Additional classes for the dropdown list container
 * - required: Whether the field is required
 * - disabled: Whether the select is disabled
 * - children: Option elements (e.g., <option value="US">United States</option>)
 * - onChange: Change handler function (receives event.target.value)
 * - value: The currently selected value
 * - placeholder: Placeholder text when no option is selected
 * - ...selectProps: Additional props for the hidden select element (if needed for form submission, but generally not used directly for styling)
 */
const SelectField = ({
  label,
  error,
  description,
  containerClassName = '',
  className = '',
  listClassName = '',
  required = false,
  disabled = false,
  children, // Will now be processed to create items
  onChange,
  value, // The current selected value
  placeholder = 'Select an option',
  ...rest // Remaining props (e.g., name, id) will be passed to the hidden select or the button
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null); // Ref for the whole component to detect outside clicks

  // For Popper positioning
  const [referenceElement, setReferenceElement] = useState(null); // The button will be the reference
  const [popperElement, setPopperElement] = useState(null); // The dropdown list will be the popper
  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    referenceElement,
    popperElement,
    { placement: 'bottom-start' },
  );

  // Convert children (option elements) into a consumable items array for the custom dropdown
  const items = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        return {
          value: child.props.value,
          label: child.props.children,
          disabled: child.props.disabled, // Pass disabled prop from option
        };
      }
      return null;
    }).filter(Boolean); // Filter out any nulls if there are non-option children
  }, [children]);

  // Find the currently selected item based on the 'value' prop
  const selectedItem = useMemo(() => {
    return items.find((item) => item.value === value);
  }, [items, value]);

  const handleSelect = (item) => {
    if (disabled || item.disabled) return; // Prevent selection if disabled

    // Mimic the native select onChange event structure
    const syntheticEvent = {
      target: {
        value: item.value,
        name: rest.name, // Pass the name if available
        id: rest.id, // Pass the id if available
      },
    };
    onChange(syntheticEvent);
    setOpen(false); // Close dropdown after selection
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col mb-4 ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={
            rest.id || `select-field-${Math.random().toString(36).substring(7)}`
          } // Provide an ID for accessibility
          className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
        >
          {label}
          {required && (
            <span className="ml-1 text-[var(--org-primary,var(--color-primary,#145fff))]">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <button
          type="button" // Important: default button type is 'submit' in forms
          ref={setReferenceElement}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          // Merge common button styles from SelectDropdown
          className={`
            w-full flex justify-between items-center rounded-xl px-4 py-2.5 text-sm
            transition duration-150 ease-in-out
            ${
              error
                ? 'border border-red-500'
                : 'border border-gray-300 dark:border-gray-600 focus:border-[var(--org-primary,var(--color-primary,#145fff))]'
            }
            ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            ${className}
          `}
          // Pass necessary props like 'id' and 'name' for form integration (if a hidden select is not used)
          {...rest}
        >
          <span
            className={`${!selectedItem ? 'text-gray-400 dark:text-gray-500' : ''}`}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 ml-2 transition-transform duration-200 ${
              open ? 'transform rotate-180' : ''
            } ${
              disabled
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div
            ref={setPopperElement}
            style={popperStyles.popper}
            {...popperAttributes.popper}
            className={`
              mt-1 w-full z-10 bg-white dark:bg-gray-800
              rounded-md shadow-lg ring-1 ring-black ring-opacity-5
              border border-gray-400 dark:border-gray-700
              max-h-60 overflow-y-auto
              ${listClassName}
            `}
          >
            <ul className="py-1">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <li
                    key={item.value || index} // Use value as key if unique, otherwise index
                    onClick={() => handleSelect(item)}
                    role="option"
                    aria-selected={
                      selectedItem && selectedItem.value === item.value
                    }
                    className={`
                      cursor-pointer px-4 py-2.5 text-sm
                      hover:bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:hover:bg-[var(--org-primary-900,rgba(20,95,255,0.9))] dark:hover:bg-opacity-20
                      text-gray-700 dark:text-gray-200
                      ${
                        selectedItem && selectedItem.value === item.value
                          ? 'bg-[var(--org-primary-100,rgba(20,95,255,0.2))] dark:bg-[var(--org-primary-800,rgba(20,95,255,0.8))] dark:bg-opacity-30 text-[var(--org-primary-700,var(--color-primary,#145fff))] dark:text-[var(--org-primary-200,rgba(20,95,255,0.4))] font-medium'
                          : ''
                      }
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {item.label}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                  No options available
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
      {!error && description && (
        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </div>
      )}
    </div>
  );
};

export default SelectField;
