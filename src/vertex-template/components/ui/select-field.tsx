"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface SelectFieldProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  label?: string;
  error?: string;
  description?: string;
  containerClassName?: string;
  className?: string;
  listClassName?: string;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onChange?: (event: { target: { value: string | number | readonly string[]; name?: string; id?: string } }) => void;
  value?: string;
  placeholder?: string;
  maxHeight?: number;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  description,
  containerClassName = "",
  className = "",
  listClassName = "",
  required = false,
  disabled = false,
  children,
  onChange,
  value,
  placeholder = "Select an option",
  maxHeight = 240,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Convert option children to items
  const items = useMemo(() => {
    const arr = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const isNativeOption = typeof child.type === "string" && child.type.toLowerCase() === "option";
        if (isNativeOption) {
          return {
            value: String(child.props.value ?? ""),
            label: child.props.children as ReactNode,
            disabled: !!child.props.disabled,
          };
        }
      }
      return null;
    })?.filter(Boolean) as { value: string; label: ReactNode; disabled: boolean }[];
    return arr || [];
  }, [children]);

  const selectedItem = useMemo(
    () => items.find((i) => String(i.value) === String(value)),
    [items, value]
  );

  const computeMenuPosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuStyles({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      minWidth: rect.width,
      maxHeight: `${maxHeight}px`,
      zIndex: 9999,
    } as React.CSSProperties);
  }, [maxHeight]);

  const handleSelect = useCallback(
    (item: { value: string; disabled?: boolean }) => {
      if (disabled || item.disabled) return;
      onChange?.({ target: { value: item.value, name: rest.name, id: rest.id } });
      setOpen(false);
      setHighlightedIndex(-1);
      buttonRef.current?.focus();
    },
    [disabled, onChange, rest.name, rest.id]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(items.length - 1);
          } else {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          }
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(0);
          } else if (highlightedIndex >= 0) {
            handleSelect(items[highlightedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          setHighlightedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "Tab":
          setOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [disabled, open, items, highlightedIndex, handleSelect]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const clickedInsideTrigger = !!(containerRef.current && target && containerRef.current.contains(target));
      const clickedInsideMenu = !!(menuContainerRef.current && target && menuContainerRef.current.contains(target));
      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };
    if (open) {
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    computeMenuPosition();
    const onResize = () => computeMenuPosition();
    const onScroll = () => computeMenuPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, computeMenuPosition]);

  // Scroll highlighted into view
  useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open, highlightedIndex]);

  const buttonId = rest.id || `select-field-${Math.random().toString(36).slice(2)}`;
  const listId = `${buttonId}-list`;

  return (
    <div ref={containerRef} className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label htmlFor={buttonId} className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          id={buttonId}
          onClick={() => !disabled && setOpen((p) => !p)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          className={`flex items-center justify-between rounded-lg px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm transition
            ${error ? "border-red-500" : "border-primary/30 dark:border-primary/40 focus:border-primary"}
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            ${className}`}
          {...rest}
        >
          <span className={`truncate ${!selectedItem ? "text-muted-foreground" : ""}`}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""} ${disabled ? "opacity-40" : "opacity-70"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open &&
          createPortal(
            <div ref={menuContainerRef} style={menuStyles} className={`bg-popover text-popover-foreground rounded-xl shadow-lg ring-1 ring-black/5 border border-border overflow-hidden ${listClassName}`}>
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-labelledby={buttonId}
                className="py-1 px-1 rounded-xl max-h-96 overflow-y-auto"
                style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight - 8}px` : maxHeight }}
              >
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const isSelected = selectedItem && String(selectedItem.value) === String(item.value);
                    const isHighlighted = highlightedIndex === index && !item.disabled;
                    return (
                      <li
                        key={item.value ?? index}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={item.disabled}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`cursor-pointer rounded-xl px-3 py-2 text-sm flex items-center justify-between transition-colors
                          ${item.disabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : "text-foreground"}
                          ${isHighlighted ? "bg-accent/50" : ""}
                          ${isSelected ? "bg-accent text-primary" : ""}
                        `}
                      >
                        <span className="truncate">{item.label}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="px-3 py-2 text-sm text-muted-foreground">No options available</li>
                )}
              </ul>
            </div>,
            document.body
          )}
      </div>

      {error && (
        <div className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {!error && description && (
        <div className="mt-1.5 text-xs text-muted-foreground">{description}</div>
      )}
    </div>
  );
};

export default SelectField;
