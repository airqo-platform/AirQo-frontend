import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';

const CustomDropdown = ({
  text = '',
  icon,
  iconPosition = 'left',
  className,
  buttonClassName,
  buttonStyle,
  menuClassName,
  children,
  defaultOpen = false,
  hideArrow = false,
  renderButton,
  trigger,
  isButton = false,
  showArrowWithButton = false,
  disabled = false,
  isCollapsed = false,
  dropdownAlign = 'left',
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside the container.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isButton) setIsOpen((prev) => !prev);
      onClick?.();
    }
  };

  // Base button classes.
  const defaultButtonClasses =
    'flex items-center justify-between rounded-xl px-4 py-2 border focus:outline-none border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm';
  const collapsedButtonClasses =
    'flex items-center justify-center rounded-xl px-4 py-3 border focus:outline-none border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm';

  const mergedButtonClasses = clsx(
    isCollapsed ? collapsedButtonClasses : defaultButtonClasses,
    disabled && 'opacity-60 cursor-not-allowed',
    buttonClassName,
  );

  const shouldShowArrow =
    !isCollapsed &&
    !hideArrow &&
    (!isButton || (isButton && showArrowWithButton));

  const renderTrigger = () => {
    if (renderButton) {
      return (
        <div
          onClick={toggleDropdown}
          className={disabled && 'opacity-60 cursor-not-allowed'}
        >
          {renderButton({ isOpen, toggleDropdown, disabled, isCollapsed })}
        </div>
      );
    }
    if (trigger) {
      return (
        <div
          onClick={toggleDropdown}
          className={disabled && 'opacity-60 cursor-not-allowed'}
        >
          {trigger}
        </div>
      );
    }
    return (
      <button
        onClick={toggleDropdown}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
        className={mergedButtonClasses}
        style={buttonStyle} // Apply custom inline styles here.
      >
        {isCollapsed ? (
          <span>{icon}</span>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {icon && iconPosition === 'left' && <span>{icon}</span>}
              {text && <span className="truncate">{text}</span>}
              {icon && iconPosition === 'right' && <span>{icon}</span>}
            </div>
            {shouldShowArrow && (
              <FiChevronDown
                size={16}
                className={clsx(
                  'ml-2 transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      className={clsx('relative inline-block', className)}
    >
      {renderTrigger()}
      {!isButton && !disabled && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={clsx(
                'absolute z-50 mt-1 p-1 rounded-xl shadow-md border bg-white dark:border-gray-700 dark:bg-[#1d1f20]',
                'w-full sm:min-w-[200px] sm:max-w-[250px]',
                dropdownAlign === 'right' ? 'right-0' : 'left-0',
                menuClassName,
              )}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {React.Children.map(children, (child) =>
                child
                  ? React.cloneElement(child, {
                      onClick: (e) => {
                        child.props.onClick?.(e);
                        setIsOpen(false);
                      },
                    })
                  : null,
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  active = false,
  className,
  disabled = false,
  // The checkIcon now uses Tailwind classes so that in light mode it appears dark blue.
  checkIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-700 dark:text-blue-300"
    >
      <path
        d="M13.3334 4L6.00002 11.3333L2.66669 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}) => (
  <button
    onClick={disabled ? undefined : onClick}
    type="button"
    disabled={disabled}
    className={clsx(
      'w-full px-4 py-2 text-left rounded-xl flex items-center text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
      active &&
        'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      disabled && 'opacity-60 cursor-not-allowed hover:bg-transparent',
      className,
    )}
  >
    <span className="flex-grow truncate">{children}</span>
    {active && <span className="ml-2">{checkIcon}</span>}
  </button>
);

export default CustomDropdown;
