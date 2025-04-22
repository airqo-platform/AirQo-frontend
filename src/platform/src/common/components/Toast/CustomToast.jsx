import { toast } from 'sonner';
import CheckCircleIcon from '@/icons/Analytics/checkCircleIcon';
import WarningIcon from '@/icons/Actions/exclamation.svg';
import { MdError } from 'react-icons/md';
import { IoInformationCircle } from 'react-icons/io5';

/**
 * Shows a customized toast notification
 *
 * @param {Object} props - Toast options
 * @param {string} [props.message='Download complete'] - The message to display in the toast
 * @param {string} [props.type='success'] - The type of toast ('success', 'warning', 'error', 'info')
 * @param {number} [props.duration] - Duration in milliseconds to show the toast
 * @param {Object} [props.style] - Additional styles to apply to the toast
 * @param {Function} [props.onDismiss] - Callback when toast is dismissed
 * @returns {string} - The toast ID
 */
const CustomToast = ({
  message = 'Download complete', // Keeping original default for backward compatibility
  type = 'success',
  duration = 5000,
  style = {},
  onDismiss,
} = {}) => {
  let icon;
  let className;

  switch (type) {
    case 'warning':
      icon = <WarningIcon width={20} height={20} className="text-white" />;
      className = 'bg-orange-600 text-white';
      break;
    case 'error':
      icon = <MdError size={20} className="text-white" />;
      className = 'bg-red-600 text-white';
      break;
    case 'info':
      icon = <IoInformationCircle size={20} className="text-white" />;
      className = 'bg-blue-600 text-white';
      break;
    case 'success':
    default:
      icon = <CheckCircleIcon width={20} height={20} className="text-white" />;
      className = 'bg-primary text-white';
      break;
  }

  // Add the common classes to className
  className +=
    ' p-4 rounded-xl w-auto border-none flex items-center justify-center space-x-2';

  // Default style with improved centering
  const defaultStyle = {
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '5px',
    position: 'fixed',
    ...style,
  };

  // Return the toast ID for potential programmatic dismissal
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
