import React, { useState, useEffect, useRef } from 'react';
import { usePopper } from 'react-popper';

/**
 * SelectDropdown Component
 *
 * Props:
 * - label: Optional label to display above the select
 * - error: Optional error message to show below the component
 * - items: Array of objects for the dropdown items, each with { value, label }
 * - selected: Currently selected item object
 * - onChange: Callback when a new item is selected
 * - placeholder: Placeholder text when no item is selected
 * - containerClassName: Additional classes for the outer container
 * - buttonClassName: Additional classes for the select button
 * - listClassName: Additional classes for the dropdown list container
 * - disabled: Whether the dropdown is disabled
 * - required: Whether the field is required
 * - ...rest: Additional props to pass to the select button
 */
const SelectDropdown = ({
  label,
  error,
  items = [],
  selected,
  onChange,
  placeholder = 'Select an option',
  containerClassName = '',
  buttonClassName = '',
  listClassName = '',
  disabled = false,
  required = false,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // For Popper positioning
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    referenceElement,
    popperElement,
    { placement: 'bottom-start' },
  );

  const handleSelect = (item) => {
    onChange(item);
    setOpen(false);
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
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          {label}{' '}
          {required && (
            <span className="ml-1 text-[var(--org-primary,var(--color-primary,#145fff))]">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          ref={setReferenceElement}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          className={`
            w-full flex justify-between items-center rounded-xl px-4 py-2.5 text-sm
            transition duration-150 ease-in-out
            ${
              error
                ? 'border border-red-500'
                : 'border border-gray-400 dark:border-gray-600 focus:border-[var(--org-primary,var(--color-primary,#145fff))]'
            }
            ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            ${buttonClassName}
          `}
          {...rest}
        >
          <span
            className={`${!selected ? 'text-gray-400 dark:text-gray-500' : ''}`}
          >
            {selected ? selected.label : placeholder}
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
                    key={index}
                    onClick={() => handleSelect(item)}
                    className={`
                      cursor-pointer px-4 py-2.5 text-sm
                      hover:bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:hover:bg-[var(--org-primary-900,rgba(20,95,255,0.9))] dark:hover:bg-opacity-20
                      text-gray-700 dark:text-gray-200
                      ${
                        selected && selected.value === item.value
                          ? 'bg-[var(--org-primary-100,rgba(20,95,255,0.2))] dark:bg-[var(--org-primary-800,rgba(20,95,255,0.8))] dark:bg-opacity-30 text-[var(--org-primary-700,var(--color-primary,#145fff))] dark:text-[var(--org-primary-200,rgba(20,95,255,0.4))] font-medium'
                          : ''
                      }
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
    </div>
  );
};

export default SelectDropdown;
