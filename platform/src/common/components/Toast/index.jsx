import React, { useState, useEffect } from 'react';
import WarningCircleIcon from '@/icons/Common/warning_circle';
import InfoCircleIcon from '@/icons/Common/info_circle.svg';
import Button from '@/components/Button';

const Toast = ({ message, type, timeout, dataTestId, size, clearData, bgColor, position }) => {
  const [visible, setVisible] = useState(true);

  const colors = {
    success: bgColor || 'bg-green-500',
    error: bgColor || 'bg-red-500',
    info: bgColor || 'bg-white',
  };

  const textColor = type === 'success' ? 'text-white' : 'text-white';

  const containerStyles = `flex ${
    size === 'sm' ? 'items-center py-1 px-2' : 'p-4'
  } w-auto text-sm ${colors[type]} ${textColor} rounded-md shadow-lg`;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <WarningCircleIcon fillcolor='#FFF' />;
      case 'info':
        return <InfoCircleIcon fill='#FFF' className='text-white w-10 h-10' />;
      default:
        return null;
    }
  };

  const handleClose = () => {
    setVisible(false);
    clearData && clearData();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      clearData && clearData();
    }, timeout || 5000);

    return () => clearTimeout(timer);
  }, [timeout]);

  return visible ? (
    <div
      className={`absolute ${
        !position ? 'top-5' : 'bottom-5'
      } left-0 right-0 z-50 flex justify-center items-center mx-4`}
      data-testid={dataTestId}
    >
      {type === 'info' ? (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50'>
          <div className={`${containerStyles} flex-col justify-center w-96 text-black-900 gap-5`}>
            {getIcon()}
            <p className='ml-2 text-black-900'>{message}</p>
            <Button onClick={handleClose} variant='filled'>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className={containerStyles}>
          {getIcon()}
          <p className='ml-2 capitalize'>{message}</p>
        </div>
      )}
    </div>
  ) : null;
};

export default Toast;
