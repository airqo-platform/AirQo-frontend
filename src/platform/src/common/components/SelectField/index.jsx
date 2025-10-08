import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { usePopper } from 'react-popper';

/**
 * SelectField Component (Improved with better positioning and accessibility)
 * Renders a custom select dropdown with an optional label and error message.
 * Props:
 * - label: Optional label text
 * - error: Optional error message
 * - description: Optional description text
 * - containerClassName: Additional classes for the container
 * - className: Additional classes for the select button
 * - listClassName: Additional classes for the dropdown list container
 * - required: Whether the field is required
 * - disabled: Whether the select is disabled
 * - children: Option elements (e.g., <option value="US">United States</option>)
 * - onChange: Change handler function (receives event.target.value)
 * - value: The currently selected value
 * - placeholder: Placeholder text when no option is selected
 * - maxHeight: Maximum height for the dropdown list (default: 240px)
 * - ...rest: Additional props for the hidden select element
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
  children,
  onChange,
  value,
  placeholder = 'Select an option',
  maxHeight = 240,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);

  // For Popper positioning with improved configuration
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const {
    styles: popperStyles,
    attributes: popperAttributes,
    update,
  } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    strategy: 'fixed', // Use fixed positioning to avoid clipping
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: [
            'top-start',
            'bottom-start',
            'top-end',
            'bottom-end',
          ],
          boundary: 'viewport',
          padding: 8,
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
          padding: 8,
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
      {
        name: 'computeStyles',
        options: {
          adaptive: false,
        },
      },
    ],
  });

  // Convert children (option elements) into a consumable items array
  const items = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        return {
          value: child.props.value,
          label: child.props.children,
          disabled: child.props.disabled,
        };
      }
      return null;
    }).filter(Boolean);
  }, [children]);

  // Find the currently selected item based on the 'value' prop
  const selectedItem = useMemo(() => {
    return items.find((item) => item.value === value);
  }, [items, value]);

  // Handle item selection
  const handleSelect = useCallback(
    (item) => {
      if (disabled || item.disabled) return;

      const syntheticEvent = {
        target: {
          value: item.value,
          name: rest.name,
          id: rest.id,
        },
      };
      onChange?.(syntheticEvent);
      setOpen(false);
      setHighlightedIndex(-1);

      // Return focus to the button after selection
      buttonRef.current?.focus();
    },
    [disabled, onChange, rest.name, rest.id],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((prev) => {
              const nextIndex = prev < items.length - 1 ? prev + 1 : 0;
              return nextIndex;
            });
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(items.length - 1);
          } else {
            setHighlightedIndex((prev) => {
              const nextIndex = prev > 0 ? prev - 1 : items.length - 1;
              return nextIndex;
            });
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(0);
          } else if (highlightedIndex >= 0) {
            handleSelect(items[highlightedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setOpen(false);
          setHighlightedIndex(-1);
          buttonRef.current?.focus();
          break;
        case 'Tab':
          setOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [disabled, open, items, highlightedIndex, handleSelect],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Update popper position when dropdown opens
  useEffect(() => {
    if (open && update) {
      update();
    }
  }, [open, update]);

  // Handle window resize and scroll to reposition dropdown
  useEffect(() => {
    if (open && update) {
      const handleResize = () => update();
      const handleScroll = () => update();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [open, update]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [open, highlightedIndex]);

  const buttonId =
    rest.id || `select-field-${Math.random().toString(36).substring(7)}`;
  const listId = `${buttonId}-list`;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col mb-4 ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={buttonId}
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
          ref={(el) => {
            buttonRef.current = el;
            setReferenceElement(el);
          }}
          type="button"
          id={buttonId}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? `${buttonId}-label` : undefined}
          aria-describedby={
            error
              ? `${buttonId}-error`
              : description
                ? `${buttonId}-description`
                : undefined
          }
          aria-controls={open ? listId : undefined}
          className={`
            w-full flex justify-between items-center rounded-xl px-4 py-2.5 text-sm
            transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-[var(--org-primary,var(--color-primary,#145fff))]
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
          {...rest}
        >
          <span
            className={`truncate ${!selectedItem ? 'text-gray-400 dark:text-gray-500' : ''}`}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 ml-2 transition-transform duration-200 flex-shrink-0 ${
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
            style={{
              ...popperStyles.popper,
              zIndex: 9999,
              minWidth: referenceElement?.offsetWidth || 'auto',
              maxHeight: `${maxHeight}px`,
            }}
            {...popperAttributes.popper}
            className={`
              bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5
              border border-gray-200 dark:border-gray-700 overflow-hidden
              ${listClassName}
            `}
          >
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={buttonId}
              className="py-1 overflow-y-auto"
              style={{ maxHeight: `${maxHeight - 16}px` }}
            >
              {items.length > 0 ? (
                items.map((item, index) => (
                  <li
                    key={item.value || index}
                    role="option"
                    aria-selected={
                      selectedItem && selectedItem.value === item.value
                    }
                    aria-disabled={item.disabled}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      cursor-pointer px-4 py-2.5 text-sm transition-colors duration-150
                      ${
                        item.disabled
                          ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-200'
                      }
                      ${
                        highlightedIndex === index && !item.disabled
                          ? 'bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:bg-[var(--org-primary-900,rgba(20,95,255,0.9))] dark:bg-opacity-20'
                          : ''
                      }
                      ${
                        selectedItem && selectedItem.value === item.value
                          ? 'bg-[var(--org-primary-100,rgba(20,95,255,0.2))] dark:bg-[var(--org-primary-800,rgba(20,95,255,0.8))] dark:bg-opacity-30 text-[var(--org-primary-700,var(--color-primary,#145fff))] dark:text-[var(--org-primary-200,rgba(20,95,255,0.4))] font-medium'
                          : ''
                      }
                      ${
                        !item.disabled
                          ? 'hover:bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:hover:bg-[var(--org-primary-900,rgba(20,95,255,0.9))] dark:hover:bg-opacity-20'
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
        <div
          id={`${buttonId}-error`}
          className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400"
        >
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
        <div
          id={`${buttonId}-description`}
          className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
        >
          {description}
        </div>
      )}
    </div>
  );
};

export default SelectField;
