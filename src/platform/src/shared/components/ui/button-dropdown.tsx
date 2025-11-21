'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  CSSProperties,
  MouseEvent,
} from 'react';
import { Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { Tooltip } from 'flowbite-react';
import clsx from 'clsx';
import { LoadingSpinner } from './loading-spinner';

// ============================================================================
// Types & Interfaces
// ============================================================================

type IconPosition = 'left' | 'right';
type DropdownAlign = 'left' | 'right';
type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left' | 'auto';

interface TriggerButtonProps {
  toggle: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  text?: string;
  isCollapsed?: boolean;
  collapseMobile?: boolean;
  hideArrow?: boolean;
  isButton?: boolean;
  showArrowWithButton?: boolean;
  isOpen?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface RenderButtonArgs {
  isOpen: boolean;
  toggle: () => void;
}

interface ButtonDropdownProps {
  text?: string;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  className?: string;
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  menuClassName?: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  hideArrow?: boolean;
  renderButton?: (args: RenderButtonArgs) => ReactNode;
  trigger?: ReactNode;
  isButton?: boolean;
  showArrowWithButton?: boolean;
  disabled?: boolean;
  isCollapsed?: boolean;
  dropdownAlign?: DropdownAlign;
  onClick?: () => void;
  dropdownWidth?: string | number;
  disableMobileCollapse?: boolean;
  mobileMinWidth?: number;
  mobileMaxWidth?: number;
  loading?: boolean;
  tooltipEnabled?: boolean;
  tooltipText?: string;
  tooltipPlacement?: TooltipPlacement;
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  className?: string;
  disabled?: boolean;
  checkIcon?: ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const MOBILE_BREAKPOINT = 640;
const DEFAULT_MOBILE_MIN_WIDTH = 120;
const DEFAULT_MOBILE_MAX_WIDTH = 300;

const BUTTON_STYLES = {
  default:
    'flex items-center justify-between rounded-lg px-4 py-2 border border-input bg-background hover:bg-muted text-foreground shadow-sm transition active:scale-95',
  collapsed:
    'flex items-center justify-center rounded-lg px-4 py-3 border border-input bg-background hover:bg-muted text-foreground shadow-sm',
} as const;

// ============================================================================
// TriggerButton Component
// ============================================================================

const TriggerButton = React.forwardRef<HTMLButtonElement, TriggerButtonProps>(
  (
    {
      toggle,
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      text,
      isCollapsed = false,
      collapseMobile = false,
      hideArrow = false,
      isButton = false,
      showArrowWithButton = false,
      isOpen = false,
      className,
      style,
    },
    ref
  ) => {
    const classes = clsx(
      isCollapsed ? BUTTON_STYLES.collapsed : BUTTON_STYLES.default,
      (disabled || loading) && 'opacity-60 cursor-not-allowed',
      className
    );

    const arrowVisible =
      !isCollapsed &&
      !hideArrow &&
      (!isButton || (isButton && showArrowWithButton));

    const showText = !collapseMobile && text;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-busy={loading}
        className={classes}
        style={style}
      >
        {loading ? (
          <LoadingSpinner size={16} />
        ) : isCollapsed ? (
          <span>{icon}</span>
        ) : (
          <>
            <div className="flex items-center gap-2 text-foreground">
              {icon && iconPosition === 'left' && <span>{icon}</span>}
              {showText && <span className="truncate">{text}</span>}
              {icon && iconPosition === 'right' && <span>{icon}</span>}
            </div>

            {!collapseMobile && arrowVisible && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={clsx(
                  'ml-2 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                aria-hidden="true"
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
  }
);

TriggerButton.displayName = 'TriggerButton';

// ============================================================================
// ButtonDropdown Component
// ============================================================================

const ButtonDropdown: React.FC<ButtonDropdownProps> = ({
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
  mobileMinWidth = DEFAULT_MOBILE_MIN_WIDTH,
  mobileMaxWidth = DEFAULT_MOBILE_MAX_WIDTH,
  loading = false,
  tooltipEnabled = false,
  tooltipText = '',
  tooltipPlacement = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false
  );

  const buttonRef = useRef<HTMLElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Responsive check
  // ============================================================================
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ============================================================================
  // Popper setup
  // ============================================================================
  const { styles, attributes, update } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      placement: dropdownAlign === 'right' ? 'bottom-end' : 'bottom-start',
      modifiers: [
        { name: 'offset', options: { offset: [0, 8] } },
        {
          name: 'preventOverflow',
          options: {
            padding: 8,
            boundary:
              typeof document !== 'undefined' ? document.body : undefined,
          },
        },
        {
          name: 'flip',
          options: { fallbackPlacements: ['top-start', 'top-end'] },
        },
      ],
    }
  );

  // ============================================================================
  // Click outside handler
  // ============================================================================
  useEffect(() => {
    if (!isOpen) return;

    const onOutside = (e: Event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isOpen]);

  // Update popper position when opened
  useEffect(() => {
    if (isOpen && update) {
      update();
    }
  }, [isOpen, update]);

  // ============================================================================
  // Handlers
  // ============================================================================
  const toggleDropdown = useCallback(() => {
    if (disabled || loading) return;
    if (!isButton) {
      setIsOpen(prev => !prev);
    }
    onClick?.();
  }, [disabled, loading, isButton, onClick]);

  // ============================================================================
  // Derived state
  // ============================================================================
  const collapseMobile = isMobile && !!icon && !disableMobileCollapse;

  const popperStyle = useMemo<CSSProperties>(() => {
    const baseStyle = { ...styles.popper };

    if (dropdownWidth) {
      return { ...baseStyle, width: dropdownWidth };
    }

    if (collapseMobile) {
      return {
        ...baseStyle,
        minWidth: mobileMinWidth,
        maxWidth: mobileMaxWidth,
      };
    }

    return {
      ...baseStyle,
      minWidth: buttonRef.current?.offsetWidth || 200,
    };
  }, [
    styles.popper,
    dropdownWidth,
    collapseMobile,
    mobileMinWidth,
    mobileMaxWidth,
  ]);

  // ============================================================================
  // Trigger element
  // ============================================================================
  const triggerElement = useMemo(() => {
    if (renderButton) {
      return (
        <span
          ref={buttonRef as React.RefObject<HTMLSpanElement>}
          className="inline-block"
        >
          {renderButton({ isOpen, toggle: toggleDropdown })}
        </span>
      );
    }

    if (trigger) {
      return (
        <span
          ref={buttonRef as React.RefObject<HTMLSpanElement>}
          className="inline-block"
        >
          {trigger}
        </span>
      );
    }

    return (
      <TriggerButton
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
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
    if (!tooltipEnabled || !tooltipText) {
      return triggerElement;
    }

    return (
      <Tooltip
        content={tooltipText}
        placement={tooltipPlacement}
        theme={{
          target: 'inline-block',
          base: 'absolute z-50 whitespace-nowrap rounded-lg py-1.5 px-3 text-sm font-medium shadow-sm',
          content:
            'relative z-10 rounded-lg bg-popover px-2.5 py-1.5 text-popover-foreground',
          arrow: {
            base: 'absolute z-10 h-2 w-2 rotate-45',
            style: {
              dark: 'bg-popover',
              light: 'bg-popover',
              auto: 'bg-popover',
            },
          },
        }}
      >
        <div className="inline-block">{triggerElement}</div>
      </Tooltip>
    );
  }, [tooltipEnabled, tooltipText, tooltipPlacement, triggerElement]);

  // ============================================================================
  // Render
  // ============================================================================
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
                'mt-1 p-1 rounded-lg shadow-md border bg-popover',
                'w-full sm:min-w-[200px]',
                menuClassName
              )}
              role="menu"
              aria-orientation="vertical"
            >
              {React.Children.map(children, child => {
                if (!child || !React.isValidElement(child)) {
                  return null;
                }

                const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
                  const props = child.props as DropdownItemProps;
                  props.onClick?.(e);
                  setIsOpen(false);
                };

                return React.cloneElement(child, {
                  onClick: handleClick,
                } as React.Attributes);
              })}
            </div>
          </Transition>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DropdownItem Component
// ============================================================================

export const DropdownItem: React.FC<DropdownItemProps> = ({
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
      className="text-primary dark:text-primary"
      aria-hidden="true"
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
    role="menuitem"
    aria-current={active ? 'true' : undefined}
    className={clsx(
      'w-full px-4 py-2 text-left rounded-lg flex items-center text-foreground transition-colors',
      !disabled && 'hover:bg-accent',
      active && 'bg-accent',
      disabled && 'opacity-60 cursor-not-allowed',
      className
    )}
  >
    <span className="flex-grow truncate">{children}</span>
    {active && <span className="flex-shrink-0 ml-2">{checkIcon}</span>}
  </button>
);

DropdownItem.displayName = 'DropdownItem';

export default ButtonDropdown;
