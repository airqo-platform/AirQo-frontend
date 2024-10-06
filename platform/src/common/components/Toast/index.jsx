import React, { useState, useEffect, useCallback } from 'react';
import WarningCircleIcon from '@/icons/Common/warning_circle';
import InfoCircleIcon from '@/icons/Common/info_circle.svg';
import Button from '@/components/Button';

const Toast = ({
  message,
  type = 'info',
  timeout = 5000,
  dataTestId,
  size = 'sm',
  clearData,
  bgColor,
  position = 'center', // Default to center positioning
}) => {
  const [visible, setVisible] = useState(true);

  // Memoize the colors object to prevent unnecessary re-renders
  const colors = useCallback(() => {
    return {
      success: bgColor || 'bg-green-500',
      error: bgColor || 'bg-red-500',
      info: bgColor || 'bg-blue-500',
    };
  }, [bgColor]);

  // Handle closing the Toast and clearing data
  const handleClose = useCallback(() => {
    setVisible(false);
    if (typeof clearData === 'function') {
      clearData();
    }
  }, [clearData]);

  // Automatically close the toast after the timeout
  useEffect(() => {
    const timer = setTimeout(handleClose, timeout);

    return () => clearTimeout(timer);
  }, [timeout, handleClose]);

  // Dynamically generate the icon based on the toast type
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <WarningCircleIcon fillcolor="#FFF" />;
      case 'info':
        return <InfoCircleIcon fill="#FFF" className="w-6 h-6" />;
      default:
        return null;
    }
  };

  // Dynamically set text color and container classes
  const textColor = 'text-white';
  const containerStyles = `flex ${
    size === 'sm' ? 'items-center py-3 px-6' : 'p-6' // Increased padding
  } w-auto text-sm ${colors()[type]} ${textColor} rounded-md shadow-lg`;

  if (!visible) return null;

  return (
    <div
      className={`absolute ${
        !position ? 'top-5' : 'bottom-5'
      } left-0 right-0 z-50 flex justify-center items-center mx-4`}
      data-testid={dataTestId}
    >
      {type === 'info' ? (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className={`${containerStyles} flex-col justify-center gap-5`}>
            {getIcon()}
            <p className="ml-2">{message}</p>
            <Button onClick={handleClose} variant="filled">
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className={containerStyles}>
          {getIcon()}
          <p className="ml-2 capitalize">{message}</p>
        </div>
      )}
    </div>
  );
};

export default Toast;
