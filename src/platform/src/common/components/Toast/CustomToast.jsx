// common/components/Toast/CustomToast.js (or .jsx)
import { toast } from 'sonner';
import { AqCheck, AqAlertCircle } from '@airqo/icons-react';
import { MdError } from 'react-icons/md';
import { IoInformationCircle } from 'react-icons/io5';

// --- Define Constants for Classes ---
const BASE_CLASSES = 'p-4 rounded-xl border-none flex items-center gap-2';
const SUCCESS_CLASSES = 'bg-primary text-white';
const ERROR_CLASSES = 'bg-red-600 text-white';
const WARNING_CLASSES = 'bg-orange-600 text-white';
const INFO_CLASSES =
  'bg-[var(--org-primary,var(--color-primary,#145fff))] text-white';

// --- Define Toast Types ---
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Shows a customized toast notification using sonner.
 *
 * @param {Object} options - Toast configuration.
 * @param {string} [options.message=''] - The message to display.
 * @param {keyof TOAST_TYPES} [options.type='success'] - The type of toast.
 * @param {number} [options.duration=5000] - Duration in milliseconds.
 * @param {Object} [options.style={}] - Additional inline styles.
 * @param {Function} [options.onDismiss] - Callback when toast is dismissed.
 * @returns {string | number} - The toast ID.
 */
const CustomToast = ({
  message = '',
  type = TOAST_TYPES.SUCCESS,
  duration = 5000,
  style: customStyle = {},
  onDismiss,
} = {}) => {
  let icon;
  // Build className string dynamically
  let className = BASE_CLASSES;

  // Determine icon and append specific classes based on type
  switch (type) {
    case TOAST_TYPES.WARNING:
      icon = <AqAlertCircle size={20} className="text-white flex-shrink-0" />;
      className += ` ${WARNING_CLASSES}`;
      break;
    case TOAST_TYPES.ERROR:
      icon = <MdError size={20} className="text-white flex-shrink-0" />;
      className += ` ${ERROR_CLASSES}`;
      break;
    case TOAST_TYPES.INFO:
      icon = (
        <IoInformationCircle size={20} className="text-white flex-shrink-0" />
      );
      className += ` ${INFO_CLASSES}`;
      break;
    case TOAST_TYPES.SUCCESS:
    default: // Defaults to success
      icon = (
        <span className="inline-flex mr-2 items-center justify-center rounded-full bg-green-600 p-1">
          <AqCheck size={12} className="text-white flex-shrink-0" />
        </span>
      );
      className += ` ${SUCCESS_CLASSES}`;
      break;
  }

  // Define default styles and merge with custom styles
  const defaultStyle = {
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '5px',
    position: 'fixed',
    minWidth: '250px',
    maxWidth: '90vw',
    width: 'auto',
    ...customStyle,
  };

  // --- Call sonner's toast function ---
  return toast(message, {
    className,
    duration,
    position: 'bottom-center',
    style: defaultStyle,
    icon,
    onDismiss,
  });
};

export default CustomToast;
