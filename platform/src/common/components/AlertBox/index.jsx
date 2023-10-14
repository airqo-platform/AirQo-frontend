import React, { useEffect } from 'react';

const AlertBox = ({ message, type, show, hide }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const alertStyles = {
    error: {
      color: 'red',
      icon: 'M11 7V11M11 15H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z',
    },
    success: {
      color: 'green',
      icon: 'M11 7V11M11 15H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z',
    },
    info: {
      color: 'blue',
      icon: 'M11 7V11M11 15H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z',
    },
  };

  const { color, icon } = alertStyles[type] || alertStyles.info;

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        hide();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`flex items-center p-4 mb-4 text-sm text-${color}-800 border border-${color}-300 rounded-lg bg-${color}-50 dark:bg-gray-800 dark:text-${color}-400 dark:border-${color}-800`}
      role='alert'>
      <svg
        width='22'
        height='22'
        viewBox='0 0 22 22'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <path
          d={icon}
          stroke={color}
          stroke-width='1.5'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </svg>
      <span className='sr-only'>{type.charAt(0).toUpperCase() + type.slice(1)} alert: </span>
      <div className='pl-2'>{message}</div>
      <button
        onClick={() => {
          setIsVisible(false);
          hide();
        }}
        className='ml-auto'>
        <svg
          width='12'
          height='12'
          viewBox='0 0 12 12'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M11 1L1 11M1 1L11 11'
            stroke={color}
            stroke-width='1.5'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </svg>
      </button>
    </div>
  );
};

export default AlertBox;
