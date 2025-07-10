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
  // mobile-specific props
  disableMobileCollapse = false,
  mobileMinWidth = 120,
  mobileMaxWidth = 300,
  loading = false, // new prop for loading state
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const buttonRef = useRef(null);
  const popperRef = useRef(null);
  const containerRef = useRef(null);

  // detect mobile viewport
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // setup popper
  const { styles, attributes, update } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      placement: dropdownAlign === 'right' ? 'bottom-end' : 'bottom-start',
      modifiers: [
        { name: 'offset', options: { offset: [0, 8] } },
        {
          name: 'preventOverflow',
          options: { padding: 8, boundary: document.body },
        },
        {
          name: 'flip',
          options: { fallbackPlacements: ['top-start', 'top-end'] },
        },
      ],
    },
  );

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // update popper position on open
  useEffect(() => {
    if (isOpen && update) update();
  }, [isOpen, update]);

  const toggleDropdown = () => {
    if (!disabled && !loading) {
      if (!isButton) setIsOpen((prev) => !prev);
      onClick?.();
    }
  };

  // determine collapse conditions for mobile
  const collapseMobile = isMobile && icon && !disableMobileCollapse;

  // button class definitions
  const defaultBtnClasses =
    'flex items-center justify-between rounded-lg px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm transition active:scale-95';
  const collapsedBtnClasses =
    'flex items-center justify-center rounded-lg px-4 py-3 border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm';

  const mergedBtnClasses = clsx(
    isCollapsed ? collapsedBtnClasses : defaultBtnClasses,
    (disabled || loading) && 'opacity-60 cursor-not-allowed',
    buttonClassName,
  );

  const showArrow =
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
        disabled={disabled || loading}
        className={mergedBtnClasses}
        style={buttonStyle}
      >
        {isCollapsed ? (
          <span>{icon}</span>
        ) : (
          <>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              {icon && iconPosition === 'left' && <span>{icon}</span>}
              {!collapseMobile && text && (
                <span className="truncate">{text}</span>
              )}
              {icon && iconPosition === 'right' && <span>{icon}</span>}
              {/* Spinner removed per user request: do not show spinner if loading is true */}
            </div>
            {!collapseMobile && showArrow && !loading && (
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

  // compute popper style for width
  const popperStyle = {
    ...styles.popper,
    ...(dropdownWidth
      ? { width: dropdownWidth }
      : collapseMobile
        ? { minWidth: mobileMinWidth, maxWidth: mobileMaxWidth }
        : { minWidth: buttonRef.current?.offsetWidth }),
  };

  return (
    <div
      ref={containerRef}
      className={clsx('relative inline-block', className)}
    >
      {renderTrigger()}
      {!isButton && !disabled && !loading && (
        <div
          ref={popperRef}
          style={popperStyle}
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
                'mt-1 p-1 rounded-lg shadow-md border bg-white dark:border-gray-700 dark:bg-[#1d1f20]',
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
  disableMobileCollapse: PropTypes.bool,
  mobileMinWidth: PropTypes.number,
  mobileMaxWidth: PropTypes.number,
  loading: PropTypes.bool,
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
      className="text-primary dark:text-blue-300"
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
      'w-full px-4 py-2 text-left rounded-lg flex items-center text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20',
      active && 'bg-primary/10 dark:bg-primary/40',
      disabled && 'opacity-60 cursor-not-allowed hover:bg-transparent',
      className,
    )}
  >
    <span className="flex-grow truncate">{children}</span>
    {active && <span className="ml-2">{checkIcon}</span>}
  </button>
);

export default CustomDropdown;
