import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { Tooltip } from 'flowbite-react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const TriggerButton = React.forwardRef(
  (
    {
      toggle,
      disabled,
      loading,
      icon,
      iconPosition,
      text,
      isCollapsed,
      collapseMobile,
      hideArrow,
      isButton,
      showArrowWithButton,
      // explicit open state for rotation/aria
      isOpen,
      className,
      style,
    },
    ref,
  ) => {
    const defaultBtn =
      'flex items-center justify-between rounded-lg px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm transition active:scale-95';
    const collapsedBtn =
      'flex items-center justify-center rounded-lg px-4 py-3 border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1d1f20] dark:text-white shadow-sm';

    const classes = clsx(
      isCollapsed ? collapsedBtn : defaultBtn,
      (disabled || loading) && 'opacity-60 cursor-not-allowed',
      className,
    );

    const arrowVisible =
      !isCollapsed &&
      !hideArrow &&
      (!isButton || (isButton && showArrowWithButton));

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={toggle}
        aria-expanded={Boolean(isOpen)}
        aria-haspopup="menu"
        className={classes}
        style={style}
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
            </div>

            {!collapseMobile && arrowVisible && !loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={clsx(
                  'ml-2 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </>
        )}
      </button>
    );
  },
);

TriggerButton.displayName = 'TriggerButton';
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
  disableMobileCollapse = false,
  mobileMinWidth = 120,
  mobileMaxWidth = 300,
  loading = false,
  tooltipEnabled = false,
  tooltipText = '',
  tooltipPlacement = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  const buttonRef = useRef(null);
  const popperRef = useRef(null);
  const containerRef = useRef(null);

  /* responsive check ------------------------------------------------------- */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* popper ----------------------------------------------------------------- */
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

  /* click-outside ---------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && update) update();
  }, [isOpen, update]);

  /* handlers --------------------------------------------------------------- */
  const toggleDropdown = useCallback(() => {
    if (disabled || loading) return;
    if (!isButton) setIsOpen((o) => !o);
    onClick?.();
  }, [disabled, loading, isButton, onClick]);

  /* derived state ---------------------------------------------------------- */
  const collapseMobile = isMobile && icon && !disableMobileCollapse;

  const popperStyle = useMemo(
    () => ({
      ...styles.popper,
      ...(dropdownWidth
        ? { width: dropdownWidth }
        : collapseMobile
          ? { minWidth: mobileMinWidth, maxWidth: mobileMaxWidth }
          : { minWidth: buttonRef.current?.offsetWidth }),
    }),
    [
      styles.popper,
      dropdownWidth,
      collapseMobile,
      mobileMinWidth,
      mobileMaxWidth,
    ],
  );

  /* trigger element -------------------------------------------------------- */
  const triggerElement = useMemo(() => {
    if (renderButton) return renderButton({ isOpen, toggle: toggleDropdown });
    if (trigger) return trigger;

    return (
      <TriggerButton
        ref={buttonRef}
        toggle={toggleDropdown}
        disabled={disabled}
        loading={loading}
        icon={icon}
        iconPosition={iconPosition}
        text={text}
        isCollapsed={isCollapsed}
        collapseMobile={collapseMobile}
        hideArrow={hideArrow}
        isButton={isButton}
        showArrowWithButton={showArrowWithButton}
        isOpen={isOpen}
        className={buttonClassName}
        style={buttonStyle}
      />
    );
  }, [
    renderButton,
    trigger,
    buttonRef,
    toggleDropdown,
    disabled,
    loading,
    icon,
    iconPosition,
    text,
    isCollapsed,
    collapseMobile,
    hideArrow,
    isButton,
    showArrowWithButton,
    buttonClassName,
    buttonStyle,
    isOpen,
  ]);

  const wrappedTrigger = useMemo(() => {
    if (!tooltipEnabled || !tooltipText) return triggerElement;

    return (
      <Tooltip content={tooltipText} placement={tooltipPlacement}>
        <div ref={buttonRef} className="inline-block">
          {triggerElement}
        </div>
      </Tooltip>
    );
  }, [tooltipEnabled, tooltipText, tooltipPlacement, triggerElement]);

  /* ----------------------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className={clsx('relative inline-block', className)}
    >
      {wrappedTrigger}

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
  tooltipEnabled: PropTypes.bool,
  tooltipText: PropTypes.string,
  tooltipPlacement: PropTypes.oneOf(['top', 'right', 'bottom', 'left', 'auto']),
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
