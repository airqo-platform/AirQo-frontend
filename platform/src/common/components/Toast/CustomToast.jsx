import { toast } from 'sonner';
import CheckCircleIcon from '@/icons/Analytics/checkCircleIcon';

const CustomToast = () => {
  toast('Download complete', {
    className:
      'bg-blue-600 text-white p-4 rounded-xl max-w-[200px] w-full flex items-center justify-center space-x-2',
    duration: 5000,
    position: 'bottom-center',
    style: {
      left: '50%',
      transform: 'translateX(10%)',
      bottom: '10px',
      position: 'fixed',
    },
    icon: <CheckCircleIcon width={20} height={20} className="text-white" />,
  });
};

export default CustomToast;
