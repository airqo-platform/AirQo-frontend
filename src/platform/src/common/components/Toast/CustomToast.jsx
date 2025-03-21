import { toast } from 'sonner';
import CheckCircleIcon from '@/icons/Analytics/checkCircleIcon';
import WarningIcon from '@/icons/Actions/exclamation.svg';

const CustomToast = ({
  message = 'Download complete',
  type = 'success',
} = {}) => {
  let icon;
  let className;

  if (type === 'warning') {
    icon = <WarningIcon width={20} height={20} className="text-white" />;
    className =
      'bg-orange-600 text-white p-4 rounded-xl max-w-[200px] w-full flex items-center justify-center space-x-2';
  } else {
    icon = <CheckCircleIcon width={20} height={20} className="text-white" />;
    className =
      'bg-blue-600 text-white p-4 rounded-xl max-w-[200px] w-full flex items-center justify-center space-x-2';
  }

  toast(message, {
    className,
    duration: 5000,
    position: 'bottom-center',
    style: {
      left: '50%',
      transform: 'translateX(10%)',
      bottom: '5px',
      position: 'fixed',
    },
    icon,
  });
};

export default CustomToast;
