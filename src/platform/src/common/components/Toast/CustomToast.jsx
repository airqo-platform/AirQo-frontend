import { toast } from 'sonner';
import {
  AqCheck,
  AqAlertCircle,
  AqAlertTriangle,
  AqAnnotationInfo,
} from '@airqo/icons-react';
import { TOAST_TYPES } from './index';

// Base styling constants
const BASE_CLASSES =
  'flex items-center gap-3 p-4 rounded-md border-none text-white font-medium shadow-lg';

// Toast configuration object for better maintainability
const TOAST_CONFIG = {
  [TOAST_TYPES.SUCCESS]: {
    icon: (
      <AqCheck
        size={20}
        className="text-white flex-shrink-0"
        aria-hidden="true"
      />
    ),
    bgClass: 'bg-green-600',
    ariaLabel: 'Success notification',
  },
  [TOAST_TYPES.ERROR]: {
    icon: (
      <AqAlertCircle
        size={20}
        className="text-white flex-shrink-0"
        aria-hidden="true"
      />
    ),
    bgClass: 'bg-red-600',
    ariaLabel: 'Error notification',
  },
  [TOAST_TYPES.WARNING]: {
    icon: (
      <AqAlertTriangle
        size={20}
        className="text-white flex-shrink-0"
        aria-hidden="true"
      />
    ),
    bgClass: 'bg-orange-600',
    ariaLabel: 'Warning notification',
  },
  [TOAST_TYPES.INFO]: {
    icon: (
      <AqAnnotationInfo
        size={20}
        className="text-white flex-shrink-0"
        aria-hidden="true"
      />
    ),
    bgClass: 'bg-primary',
    ariaLabel: 'Information notification',
  },
};

/**
 * Shows a customized toast notification using Sonner.
 *
 * @param {Object} options - Toast configuration options
 * @param {string} [options.message=''] - The message to display
 * @param {keyof TOAST_TYPES} [options.type='info'] - The type of toast
 * @param {number} [options.duration=5000] - Duration in milliseconds (0 = permanent)
 * @param {Object} [options.style={}] - Additional inline styles
 * @param {string} [options.position='bottom-center'] - Toast position
 * @param {boolean} [options.closeButton=true] - Show close button
 * @param {Function} [options.onDismiss] - Callback when toast is dismissed
 * @param {Function} [options.onClick] - Callback when toast is clicked
 * @param {string} [options.className=''] - Additional CSS classes
 * @param {Object} [options.action] - Action button configuration
 * @returns {string | number} - The toast ID for manual dismissal
 */
const CustomToast = ({
  message = '',
  type = TOAST_TYPES.INFO,
  duration = 5000,
  style: customStyle = {},
  position = 'bottom-center',
  closeButton = false,
  onDismiss,
  onClick,
  className = '',
  action,
  ...additionalOptions
} = {}) => {
  // Validate toast type
  if (!TOAST_CONFIG[type]) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid toast type: ${type}. Falling back to INFO.`);
    type = TOAST_TYPES.INFO;
  }

  const config = TOAST_CONFIG[type];

  // Build complete className
  const toastClassName = `${BASE_CLASSES} ${config.bgClass} ${className}`;

  // Default positioning styles
  const defaultStyle = {
    minWidth: '300px',
    maxWidth: '500px',
    width: 'auto',
    ...customStyle,
  };

  // Toast options for Sonner
  const toastOptions = {
    className: toastClassName,
    duration,
    position,
    style: defaultStyle,
    icon: config.icon,
    // always disable sonner's built-in close bubble here; we provide an explicit action when needed
    closeButton: false,
    onDismiss,
    onClick,
    'aria-label': config.ariaLabel,
    role: 'alert',
    'aria-live': 'polite',
    ...additionalOptions,
  };

  // Add action button if provided
  if (action) {
    toastOptions.action = {
      label: action.label || 'Action',
      onClick: action.onClick || (() => {}),
      ...action,
    };
  }

  // If caller requested a close button, add an explicit textual Close action
  if (closeButton) {
    toastOptions.action = toastOptions.action || {
      label: 'Close',
      onClick: () => toast.dismiss(),
    };
  }

  return toast(message, toastOptions);
};

// Convenience methods for each toast type
CustomToast.success = (message, options = {}) =>
  CustomToast({
    message,
    type: TOAST_TYPES.SUCCESS,
    ...options,
  });

CustomToast.error = (message, options = {}) =>
  CustomToast({
    message,
    type: TOAST_TYPES.ERROR,
    duration: 7000, // Longer duration for errors
    ...options,
  });

CustomToast.warning = (message, options = {}) =>
  CustomToast({
    message,
    type: TOAST_TYPES.WARNING,
    duration: 6000, // Slightly longer for warnings
    ...options,
  });

CustomToast.info = (message, options = {}) =>
  CustomToast({
    message,
    type: TOAST_TYPES.INFO,
    ...options,
  });

// Promise-based toast for async operations
CustomToast.promise = (promise, options = {}) => {
  const {
    loading = 'Loading...',
    success = 'Success!',
    error: errorMessage = 'Something went wrong',
    loadingIcon = (
      <AqAnnotationInfo
        size={20}
        className="text-white flex-shrink-0 animate-spin"
      />
    ),
    ...restOptions
  } = options;

  return toast.promise(promise, {
    loading: {
      render: loading,
      icon: loadingIcon,
      className: `${BASE_CLASSES} bg-blue-600`,
      'aria-label': 'Loading notification',
    },
    success: (data) => ({
      render: typeof success === 'function' ? success(data) : success,
      icon: TOAST_CONFIG[TOAST_TYPES.SUCCESS].icon,
      className: `${BASE_CLASSES} ${TOAST_CONFIG[TOAST_TYPES.SUCCESS].bgClass}`,
      'aria-label': 'Success notification',
    }),
    error: (err) => ({
      render:
        typeof errorMessage === 'function' ? errorMessage(err) : errorMessage,
      icon: TOAST_CONFIG[TOAST_TYPES.ERROR].icon,
      className: `${BASE_CLASSES} ${TOAST_CONFIG[TOAST_TYPES.ERROR].bgClass}`,
      'aria-label': 'Error notification',
    }),
    ...restOptions,
  });
};

// Dismiss all toasts
CustomToast.dismiss = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Check if toasts are supported
CustomToast.isSupported = () => {
  return typeof toast !== 'undefined';
};

export default CustomToast;
