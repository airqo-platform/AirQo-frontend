'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { usePopper } from 'react-popper';

interface SelectFieldProps {
  label?: string;
  error?: string;
  description?: string;
  containerClassName?: string;
  className?: string;
  listClassName?: string;
  required?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (event: {
    target: { value: unknown; name?: string; id?: string };
  }) => void;
  value?: unknown;
  placeholder?: string;
  maxHeight?: number;
  name?: string;
  id?: string;
}

const SelectField: React.FC<SelectFieldProps & Record<string, unknown>> = ({
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const {
    styles: popperStyles,
    attributes: popperAttributes,
    update,
  } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    strategy: 'fixed',
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
          padding: 8,
        },
      },
      {
        name: 'preventOverflow',
        options: {
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

  type Item = {
    value: string | number;
    label: React.ReactNode;
    disabled?: boolean;
  };
  const items = useMemo<Item[]>(() => {
    return (
      React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          const props = child.props as {
            value?: string | number;
            children?: React.ReactNode;
            disabled?: boolean;
          };
          if (typeof props.value !== 'undefined') {
            return {
              value: props.value as string | number,
              label: props.children,
              disabled: props.disabled,
            } as Item;
          }
        }
        return null;
      })?.filter(Boolean) ?? []
    );
  }, [children]);

  const selectedItem = useMemo(() => {
    return items.find(item => item.value === value);
  }, [items, value]);

  const restProps = rest as {
    name?: string;
    id?: string;
    [k: string]: unknown;
  };

  const handleSelect = useCallback(
    (item: Item) => {
      if (disabled || item.disabled) return;
      const syntheticEvent = {
        target: {
          value: item.value,
          name: restProps.name,
          id: restProps.id,
        },
      };
      onChange?.(syntheticEvent);
      setOpen(false);
      setHighlightedIndex(-1);
      buttonRef.current?.focus();
    },
    [disabled, onChange, restProps.name, restProps.id]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch ((event as React.KeyboardEvent).key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex(prev => {
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
            setHighlightedIndex(prev => {
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
    [disabled, open, items, highlightedIndex, handleSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  useEffect(() => {
    if (open && update) {
      update();
    }
  }, [open, update]);

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

  useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as
        | HTMLElement
        | undefined;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [open, highlightedIndex]);

  const buttonId =
    (restProps.id as string) ||
    `select-field-${Math.random().toString(36).substring(7)}`;
  const listId = `${buttonId}-list`;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col mb-4 ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={buttonId}
          className="flex items-center mb-2 text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={el => {
            buttonRef.current = el;
            setReferenceElement(el);
          }}
          type="button"
          id={buttonId}
          onClick={() => !disabled && setOpen(prev => !prev)}
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
            w-full flex justify-between items-center rounded-md px-4 py-2.5 text-sm
            transition duration-150 ease-in-out focus:outline-none
            ${
              error
                ? 'border border-destructive focus:border-destructive'
                : 'border border-input focus:border-primary'
            }
            ${
              disabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-background text-foreground hover:bg-muted'
            }
            ${className}
          `}
          {...rest}
        >
          <span
            className={`truncate ${!selectedItem ? 'text-muted-foreground' : ''}`}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 ml-2 transition-transform duration-200 flex-shrink-0 ${open ? 'transform rotate-180' : ''} ${
              disabled ? 'text-muted-foreground' : 'text-muted-foreground'
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
            {...(popperAttributes.popper ?? {})}
            className={`
              bg-popover rounded-md shadow-lg ring-1 ring-ring
              border border-border overflow-hidden
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
                items.map((item: Item, index: number) => (
                  <li
                    key={item.value ?? index}
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
                          ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                          : 'text-foreground'
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
                      ${!item.disabled ? 'hover:bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:hover:bg-[var(--org-primary-900,rgba(20,95,255,0.9))] dark:hover:bg-opacity-20' : ''}
                    `}
                  >
                    {item.label}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2.5 text-sm text-muted-foreground">
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
          className="mt-1.5 flex items-center text-xs text-destructive"
        >
          <svg
            className="flex-shrink-0 w-4 h-4 mr-1"
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
          className="mt-1.5 text-xs text-muted-foreground"
        >
          {description}
        </div>
      )}
    </div>
  );
};

export default SelectField;
