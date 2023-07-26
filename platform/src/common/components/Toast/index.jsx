import { useState, useEffect } from 'react';
import WarningCircleIcon from '@/icons/Common/warning_circle';

const Toast = ({ message, type, timeout, dataTestId, size }) => {
  const [visible, setVisible] = useState(true);
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const textColor = type === 'success' ? 'text-black-600' : 'text-white';

  const containerStyles = `flex ${
    size === 'sm' ? 'items-center py-1 px-2' : 'p-4'
  } w-auto text-sm ${
    colors[type] || 'bg-red-500'
  } ${textColor} rounded-md shadow-lg transition-opacity`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, timeout || 5000);

    return () => clearTimeout(timer);
  }, [timeout]);

  return visible ? (
    <div
      className='absolute top-5 left-0 right-0 z-50 flex justify-center items-center mx-4'
      data-testid={dataTestId}
    >
      <div className={containerStyles}>
        {type === 'error' && <WarningCircleIcon fillColor='#FFF' />}
        <p className='ml-2'>{message}</p>
      </div>
    </div>
  ) : null;
};

export default Toast;
