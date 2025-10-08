import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AqCheck,
  AqAlertCircle,
  AqAlertTriangle,
  AqInfoCircle,
  AqX,
} from '@airqo/icons-react';
import Button from '@/common/components/Button';

// Toast type constants
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast configuration for consistency
export const TOAST_CONFIG = {
  [TOAST_TYPES.SUCCESS]: {
    icon: AqCheck,
    bgClass: 'bg-green-500',
    borderClass: 'border-green-600',
    ariaLabel: 'Success message',
  },
  [TOAST_TYPES.ERROR]: {
    icon: AqAlertCircle,
    bgClass: 'bg-red-500',
    borderClass: 'border-red-600',
    ariaLabel: 'Error message',
  },
  [TOAST_TYPES.WARNING]: {
    icon: AqAlertTriangle,
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-600',
    ariaLabel: 'Warning message',
  },
  [TOAST_TYPES.INFO]: {
    icon: AqInfoCircle,
    bgClass: 'bg-primary',
    borderClass: 'border-primary',
    ariaLabel: 'Information message',
  },
};

/**
 * Toast component for displaying notifications with auto-dismiss functionality.
 *
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display
 * @param {keyof TOAST_TYPES} [props.type='info'] - The type of toast
 * @param {number} [props.timeout=5000] - Auto-dismiss timeout in ms (0 = no auto-dismiss)
 * @param {string} [props.dataTestId] - Test ID for testing
 * @param {'sm'|'md'|'lg'} [props.size='sm'] - Size variant
 * @param {Function} [props.clearData] - Legacy callback when toast is dismissed
 * @param {Function} [props.onClose] - Callback when toast is closed
 * @param {string} [props.bgColor] - Custom background color class
 * @param {'top'|'bottom'} [props.position='bottom'] - Vertical position
 * @param {boolean} [props.showCloseButton=true] - Whether to show close button
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.persistent=false] - Whether toast persists on hover
 * @param {Function} [props.onClick] - Callback when toast is clicked
 */
const Toast = ({
  message,
  type = TOAST_TYPES.INFO,
  timeout = 5000,
  dataTestId,
  size = 'sm',
  clearData,
  onClose,
  bgColor,
  position = 'bottom',
  showCloseButton = false,
  className = '',
  persistent = false,
  onClick,
}) => {
  const [visible, setVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);
  const toastRef = useRef(null);
  const closedRef = useRef(false);

  // Validate and get toast configuration
  const config = TOAST_CONFIG[type] || TOAST_CONFIG[TOAST_TYPES.INFO];
  const IconComponent = config.icon;

  // Handle toast dismissal
  const handleClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    // ensure any pending timer is cleared
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);

    // Call legacy clearData callback
    if (typeof clearData === 'function') {
      clearData();
    }

    // Call modern onClose callback
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [clearData, onClose]);

  // Handle toast click
  const handleToastClick = useCallback(
    (event) => {
      if (typeof onClick === 'function') {
        onClick(event);
      }
    },
    [onClick],
  );

  // Setup auto-dismiss timer
  const setupTimer = useCallback(() => {
    if (timeout > 0 && !isPaused) {
      timeoutRef.current = setTimeout(handleClose, timeout);
    }
  }, [timeout, isPaused, handleClose]);

  // Clear existing timer
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle mouse enter (pause timer if persistent)
  const handleMouseEnter = useCallback(() => {
    if (persistent) {
      setIsPaused(true);
      clearTimer();
    }
  }, [persistent, clearTimer]);

  // Handle mouse leave (resume timer if persistent)
  const handleMouseLeave = useCallback(() => {
    if (persistent) {
      setIsPaused(false);
    }
  }, [persistent]);

  // Setup initial timer
  useEffect(() => {
    setupTimer();
    return clearTimer;
  }, [setupTimer, clearTimer]);

  // Resume timer when not paused
  useEffect(() => {
    if (!isPaused && persistent) {
      setupTimer();
    }
    return clearTimer;
  }, [isPaused, persistent, setupTimer, clearTimer]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (visible && toastRef.current) {
      // Announce to screen readers but don't steal focus
      toastRef.current.setAttribute('aria-live', 'polite');
    }
  }, [visible]);

  // Get background color class
  const getBackgroundClass = () => {
    return bgColor || config.bgClass;
  };

  // Get size classes
  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'py-3 px-4 text-sm',
      md: 'py-4 px-5 text-base',
      lg: 'py-5 px-6 text-lg',
    };
    return sizeMap[size] || sizeMap.sm;
  };

  // Build container classes
  const containerClasses = [
    'flex items-center gap-3 w-auto text-white rounded-md shadow-lg',
    'transform transition-all duration-300 ease-in-out',
    'border-l-4',
    getSizeClasses(),
    getBackgroundClass(),
    config.borderClass,
    className,
    onClick ? 'cursor-pointer hover:scale-[1.02]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Position classes
  const positionClasses = [
    'fixed',
    position === 'top' ? 'top-5' : 'bottom-5',
    'left-1/2 transform -translate-x-1/2',
    'z-50 mx-4 max-w-md w-auto',
    'animate-in slide-in-from-bottom-2 fade-in duration-300',
  ].join(' ');

  if (!visible) return null;

  return (
    <div
      className={positionClasses}
      data-testid={dataTestId}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        ref={toastRef}
        className={containerClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToastClick}
        aria-label={config.ariaLabel}
      >
        {/* Icon */}
        <IconComponent
          size={size === 'lg' ? 24 : 20}
          className="text-white flex-shrink-0"
          aria-hidden="true"
        />

        {/* Message */}
        <p className="flex-1 break-words leading-relaxed font-medium">
          {message}
        </p>

        {/* Close Button */}
        {showCloseButton && (
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            Icon={AqX}
            className="text-white hover:bg-white/20 border-none p-1 ml-2 flex-shrink-0"
            aria-label="Close notification"
            type="button"
          />
        )}
      </div>
    </div>
  );
};

// Display name for debugging
Toast.displayName = 'Toast';

export default Toast;
