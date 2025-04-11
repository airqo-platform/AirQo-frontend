import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';

const CustomDropdown = ({
  text = '',
  icon,
  iconPosition = 'left',
  className,
  buttonClassName,
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
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [referenceElement, setReferenceElement] = useState(null);
  const containerRef = useRef(null);
  const [buttonDimensions, setButtonDimensions] = useState({
    width: 200,
    height: 0,
  });

  // Update button dimensions on mount and resize.
  useEffect(() => {
    if (referenceElement) {
      const rect = referenceElement.getBoundingClientRect();
      setButtonDimensions({ width: rect.width, height: rect.height });
    }
  }, [referenceElement]);

  useEffect(() => {
    const handleResize = () => {
      if (referenceElement) {
        const rect = referenceElement.getBoundingClientRect();
        setButtonDimensions({ width: rect.width, height: rect.height });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [referenceElement]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isButton) setIsOpen((prev) => !prev);
    if (onClick) onClick();
  };

  // Default styles for button with dark mode support.
  const defaultButtonClasses = clsx(
    'flex items-center justify-between rounded-xl px-4 py-2 border focus:outline-none',
    'border-gray-200 bg-white hover:bg-gray-50',
    'dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white',
    'shadow-sm',
  );

  // Default styles for menu with dark mode support.
  const defaultMenuClasses = clsx(
    'border rounded-xl shadow-md p-1 overflow-hidden',
    'border-gray-200 bg-white',
    'dark:border-gray-700 dark:bg-[#1d1f20]',
  );

  // Merge provided button classes.
  const mergedButtonClasses = buttonClassName
    ? clsx(
        'flex items-center justify-between rounded-xl px-4 py-2 focus:outline-none',
        buttonClassName,
        disabled && 'opacity-60 cursor-not-allowed',
      )
    : clsx(
        defaultButtonClasses,
        disabled &&
          'opacity-60 cursor-not-allowed hover:bg-white dark:hover:bg-gray-800',
      );

  // Dropdown container style – positioned absolutely below the button.
  const dropdownStyle = {
    position: 'absolute',
    top: buttonDimensions.height + 2,
    left: 0,
    zIndex: 9999,
    minWidth: `${Math.max(200, buttonDimensions.width)}px`,
    maxWidth: '250px',
    whiteSpace: 'normal',
  };

  // Determine if the arrow should be shown.
  const shouldShowArrow =
    !hideArrow && (!isButton || (isButton && showArrowWithButton));

  // Render trigger button using renderButton, trigger, or default.
  const renderTrigger = () => {
    if (renderButton) {
      return (
        <div
          ref={setReferenceElement}
          onClick={toggleDropdown}
          className={disabled ? 'opacity-60 cursor-not-allowed' : ''}
        >
          {renderButton({ isOpen, toggleDropdown, disabled, isCollapsed })}
        </div>
      );
    } else if (trigger) {
      return (
        <div
          ref={setReferenceElement}
          onClick={toggleDropdown}
          className={disabled ? 'opacity-60 cursor-not-allowed' : ''}
        >
          {trigger}
        </div>
      );
    } else {
      return (
        <button
          ref={setReferenceElement}
          onClick={toggleDropdown}
          className={mergedButtonClasses}
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            {!isCollapsed && text && (
              <span className="text-current truncate whitespace-nowrap">
                {text}
              </span>
            )}
            {icon && iconPosition === 'right' && <span>{icon}</span>}
          </div>
          {!isCollapsed && shouldShowArrow && (
            <FiChevronDown
              size={16}
              className={clsx(
                'ml-2 transition-transform duration-150 text-current',
                isOpen && 'rotate-180',
              )}
            />
          )}
        </button>
      );
    }
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
              style={dropdownStyle}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={clsx(defaultMenuClasses, menuClassName)}
            >
              {React.Children.map(children, (child) =>
                child
                  ? React.cloneElement(child, {
                      onClick: (e) => {
                        if (child.props.onClick) child.props.onClick(e);
                        setIsOpen(false);
                      },
                    })
                  : child,
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
  checkIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
    className={clsx(
      'w-full px-4 py-2 text-left rounded-xl flex items-center',
      'text-gray-700 hover:bg-gray-100',
      'dark:text-gray-200 dark:hover:bg-gray-700',
      active &&
        'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      disabled &&
        'opacity-60 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
      className,
    )}
    disabled={disabled}
  >
    <span className="flex-grow truncate whitespace-nowrap">{children}</span>
    {active && <span className="ml-2">{checkIcon}</span>}
  </button>
);

export default CustomDropdown;
