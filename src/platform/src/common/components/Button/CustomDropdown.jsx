import React, { useState, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';
import PropTypes from 'prop-types';

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
  dropdownWidth,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const buttonRef = useRef(null);
  const popperRef = useRef(null);
  const containerRef = useRef(null);

  // Set up popper with proper placement based on dropdownAlign
  const { styles, attributes, update } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      placement: dropdownAlign === 'right' ? 'bottom-end' : 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 8,
            boundary: document.body,
          },
        },
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top-start', 'top-end'],
          },
        },
      ],
    },
  );

  // Close dropdown when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update popper position when dropdown visibility changes
  useEffect(() => {
    if (isOpen && update) {
      update();
    }
  }, [isOpen, update]);

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isButton) setIsOpen((prev) => !prev);
      onClick?.();
    }
  };

  // Base button classes
  const defaultButtonClasses =
    'flex items-center justify-between rounded-xl px-4 py-2 border focus:outline-none border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm transition transform active:scale-95';
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
          ref={buttonRef}
          onClick={toggleDropdown}
          className={disabled ? 'opacity-60 cursor-not-allowed' : ''}
        >
          {renderButton({ isOpen, toggleDropdown, disabled, isCollapsed })}
        </div>
      );
    }
    if (trigger) {
      return (
        <div
          ref={buttonRef}
          onClick={toggleDropdown}
          className={disabled ? 'opacity-60 cursor-not-allowed' : ''}
        >
          {trigger}
        </div>
      );
    }
    return (
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
        className={mergedButtonClasses}
        style={buttonStyle}
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
                  'ml-2 transition-transform duration-200',
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
        <div
          ref={popperRef}
          style={{
            ...styles.popper,
            ...(dropdownWidth
              ? { width: dropdownWidth }
              : { minWidth: buttonRef.current?.offsetWidth }),
          }}
          {...attributes.popper}
          className="z-50 w-full"
        >
          <Transition
            show={isOpen}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <div
              className={clsx(
                'mt-1 p-1 rounded-xl shadow-md border bg-white dark:border-gray-700 dark:bg-[#1d1f20]',
                'w-full sm:min-w-[200px]',
                menuClassName,
              )}
              style={{ minWidth: buttonRef.current?.offsetWidth }}
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
            </div>
          </Transition>
        </div>
      )}
    </div>
  );
};

CustomDropdown.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  buttonStyle: PropTypes.object,
  menuClassName: PropTypes.string,
  children: PropTypes.node,
  defaultOpen: PropTypes.bool,
  hideArrow: PropTypes.bool,
  renderButton: PropTypes.func,
  trigger: PropTypes.node,
  isButton: PropTypes.bool,
  showArrowWithButton: PropTypes.bool,
  disabled: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  dropdownAlign: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  dropdownWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
