import React from 'react';
import Spinner from '@/components/Spinner';

const ChartRefreshIndicator = ({
  isVisible,
  message = 'Refreshing data',
  position = 'top-left',
  className = '',
}) => {
  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-12 left-4';
      case 'top-right':
        return 'top-12 right-4';
      case 'top-center':
        return 'top-12 left-1/2 transform -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-12 left-4';
    }
  };

  return (
    <div
      className={`
        absolute ${getPositionClasses()} 
        bg-blue-50 dark:bg-blue-900/20 
        text-primary dark:text-blue-300 
        px-3 py-1.5 rounded-md flex items-center 
        z-20 shadow-sm border border-blue-200 dark:border-blue-800
        animate-fadeIn
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Spinner size={14} className="text-current" />
      <span className="text-sm font-medium ml-2">{message}</span>
    </div>
  );
};

export default React.memo(ChartRefreshIndicator);
