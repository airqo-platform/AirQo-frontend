'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { usePopper } from 'react-popper';
import { cn } from '@/shared/lib/utils';
import { SearchField } from './search-field';

/** Flattens an option's children into searchable text. */
const toText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(toText).join(' ');
  }
  if (React.isValidElement(node)) {
    return toText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
};

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
  /** Optional heading rendered above the option list inside the popper. Not an option — never selectable or keyboard-highlighted. */
  listHeader?: React.ReactNode;
  onChange?: (event: {
    target: { value: unknown; name?: string; id?: string };
  }) => void;
  value?: unknown;
  placeholder?: string;
  maxHeight?: number;
  name?: string;
  id?: string;
  /** Visual density. `control` renders a header-style control matching the organization selector (h-10, primary border, focus ring). */
  size?: 'default' | 'control';
  /**
   * Show a filter box above the option list. Use this whenever the option list
   * can grow past a screenful (assignees, sites, groups): scrolling a long
   * native-style list to find one entry is unusable past ~10 options.
   *
   * Options are matched against their visible label, plus any `data-search`
   * attribute on the `<option>`, so an option can stay short in the list while
   * still being findable by a field that is not displayed (e.g. an email).
   */
  searchable?: boolean;
  /** Placeholder shown in the filter box. */
  searchPlaceholder?: string;
  /** Shown when a search matches nothing. */
  noOptionsMessage?: string;
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
  size = 'default',
  listHeader,
  searchable = false,
  searchPlaceholder = 'Search…',
  noOptionsMessage = 'No matches',
  ...rest
}) => {
  const isControl = size === 'control';
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    /** Extra text this option is searchable by but does not display. */
    searchText?: string;
  };
  const items = useMemo<Item[]>(() => {
    return (
      React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          const props = child.props as {
            value?: string | number;
            children?: React.ReactNode;
            disabled?: boolean;
            'data-search'?: string;
          };
          if (typeof props.value !== 'undefined') {
            return {
              value: props.value as string | number,
              label: props.children,
              disabled: props.disabled,
              searchText: props['data-search'],
            } as Item;
          }
        }
        return null;
      })?.filter(Boolean) ?? []
    );
  }, [children]);

  // Lowercased haystack per option: visible label + any `data-search` text.
  const searchTexts = useMemo(
    () =>
      items.map(item =>
        `${toText(item.label)} ${item.searchText ?? ''}`.trim().toLowerCase()
      ),
    [items]
  );

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!searchable || !needle) return items;
    return items.filter((_, index) => searchTexts[index].includes(needle));
  }, [items, searchTexts, query, searchable]);

  const selectedItem = useMemo(() => {
    return items.find(item => item.value === value);
  }, [items, value]);

  const restProps = rest as {
    name?: string;
    id?: string;
    [k: string]: unknown;
  };

  const closeDropdown = useCallback((returnFocus = true) => {
    setOpen(false);
    setHighlightedIndex(-1);
    setQuery('');
    if (returnFocus) buttonRef.current?.focus();
  }, []);

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
      closeDropdown();
    },
    [disabled, onChange, restProps.name, restProps.id, closeDropdown]
  );

  /** Moves the highlight within the currently visible (possibly filtered) list. */
  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      if (visibleItems.length === 0) return;
      setHighlightedIndex(prev => {
        const next = prev + direction;
        if (next < 0) return visibleItems.length - 1;
        if (next > visibleItems.length - 1) return 0;
        return next;
      });
    },
    [visibleItems.length]
  );

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch ((event as React.KeyboardEvent).key) {
        case 'ArrowDown':
          event.preventDefault();
          moveHighlight(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveHighlight(-1);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && visibleItems[highlightedIndex]) {
            handleSelect(visibleItems[highlightedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeDropdown();
          break;
        case 'Tab':
          closeDropdown(false);
          break;
      }
    },
    [moveHighlight, highlightedIndex, visibleItems, handleSelect, closeDropdown]
  );

  // The trigger keeps full keyboard control when there is no filter box.
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
            moveHighlight(1);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(visibleItems.length - 1);
          } else {
            moveHighlight(-1);
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(0);
          } else if (highlightedIndex >= 0) {
            handleSelect(visibleItems[highlightedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeDropdown();
          break;
        case 'Tab':
          closeDropdown(false);
          break;
      }
    },
    [
      disabled,
      open,
      moveHighlight,
      highlightedIndex,
      visibleItems,
      handleSelect,
      closeDropdown,
    ]
  );

  // A new search result set invalidates the old highlight position, and the
  // top match becomes the target so Enter picks it without an extra arrow press.
  useEffect(() => {
    if (!searchable) return;
    setHighlightedIndex(visibleItems.length > 0 ? 0 : -1);
  }, [query, searchable, visibleItems.length]);

  // Move focus into the filter box as soon as the popper opens.
  useEffect(() => {
    if (open && searchable) {
      searchInputRef.current?.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, closeDropdown]);

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
  const optionId = (index: number) => `${listId}-option-${index}`;
  // The filter box takes vertical room, so the list gets whatever is left.
  const listMaxHeight = maxHeight - (searchable ? 56 : 16);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col',
        isControl ? 'mb-0' : 'mb-4',
        containerClassName
      )}
    >
      {label && (
        <label
          id={`${buttonId}-label`}
          className={`flex items-center text-foreground ${isControl ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}
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
            w-full flex justify-between items-center rounded-md ${
              isControl
                ? 'h-10 px-3 py-0 text-sm font-medium'
                : 'px-4 py-2.5 text-sm'
            }
            transition duration-150 ease-in-out focus:outline-none
            ${
              error
                ? 'border border-destructive focus:border-destructive'
                : isControl
                  ? 'border border-primary/30 focus:border-primary'
                  : 'border border-input focus:border-primary'
            }
            ${
              disabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : isControl
                  ? 'bg-transparent text-foreground hover:bg-primary/5'
                  : 'bg-background text-foreground hover:bg-muted'
            }
            ${
              isControl
                ? 'focus:ring-2 focus:ring-primary focus:ring-offset-2'
                : ''
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
            className={`${
              isControl ? 'w-4 h-4 ml-2' : 'w-5 h-5 ml-2'
            } transition-transform duration-200 flex-shrink-0 ${open ? 'transform rotate-180' : ''} ${
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
              // Above dialogs (z-[10001]) so the dropdown stays visible
              // when opened inside a modal.
              zIndex: 10002,
              minWidth: referenceElement?.offsetWidth || 'auto',
              maxHeight: `${maxHeight}px`,
            }}
            {...(popperAttributes.popper ?? {})}
            className={`
              bg-popover rounded-md shadow-lg
              border border-primary overflow-hidden
              ${listClassName}
            `}
          >
            {listHeader ? (
              <div
                role="presentation"
                className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {listHeader}
              </div>
            ) : null}
            {searchable ? (
              <div className="border-b border-border/60 p-2">
                <SearchField
                  ref={searchInputRef}
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  onKeyDown={handleListKeyDown}
                  placeholder={searchPlaceholder}
                  showClearButton={false}
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-labelledby={label ? `${buttonId}-label` : undefined}
                  aria-activedescendant={
                    highlightedIndex >= 0
                      ? optionId(highlightedIndex)
                      : undefined
                  }
                  className="h-9"
                />
              </div>
            ) : null}
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={buttonId}
              className="py-1 overflow-y-auto"
              style={{ maxHeight: `${listMaxHeight}px` }}
            >
              {visibleItems.length > 0 ? (
                visibleItems.map((item: Item, index: number) => (
                  <li
                    key={item.value ?? index}
                    id={optionId(index)}
                    role="option"
                    aria-selected={
                      selectedItem && selectedItem.value === item.value
                    }
                    aria-disabled={item.disabled}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      cursor-pointer transition-colors duration-150 ${
                        isControl ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm'
                      }
                      ${
                        item.disabled
                          ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                          : 'text-foreground'
                      }
                      ${
                        highlightedIndex === index && !item.disabled
                          ? 'bg-primary/10'
                          : ''
                      }
                      ${
                        selectedItem && selectedItem.value === item.value
                          ? 'bg-primary/20 text-primary font-medium'
                          : ''
                      }
                      ${!item.disabled ? 'hover:bg-primary/10' : ''}
                    `}
                  >
                    {item.label}
                  </li>
                ))
              ) : (
                <li
                  className={`text-muted-foreground ${
                    isControl ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm'
                  }`}
                >
                  {searchable && query.trim()
                    ? `${noOptionsMessage} for “${query.trim()}”`
                    : 'No options available'}
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
