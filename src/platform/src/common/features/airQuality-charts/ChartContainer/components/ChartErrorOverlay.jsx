import React from 'react';

const ChartErrorOverlay = ({
  error,
  onRetry,
  isDark,
  title = 'Unable to load chart data',
  showRetryButton = true,
  className = '',
}) => {
  if (!error) return null;

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'There was a problem retrieving the data. Please try again.';
  };

  const getOverlayClasses = () => {
    const baseClasses = `
      absolute top-0 left-0 w-full h-full 
      flex flex-col items-center justify-center 
      p-4 z-10 rounded-md
    `;

    const themeClasses = isDark
      ? 'bg-gray-800 bg-opacity-80'
      : 'bg-gray-100 bg-opacity-80';

    return `${baseClasses} ${themeClasses} ${className}`;
  };

  const getCardClasses = () => {
    const baseClasses = `
      p-4 rounded-lg shadow-md 
      flex flex-col items-center 
      max-w-md transition-colors duration-200
    `;

    const themeClasses = isDark
      ? 'bg-gray-700 border border-gray-600'
      : 'bg-white border border-gray-200';

    return `${baseClasses} ${themeClasses}`;
  };

  const getIconColor = () => {
    return isDark ? '#F87171' : '#EF4444';
  };

  const getTitleColor = () => {
    return isDark ? '#F87171' : '#EF4444';
  };

  const getTextColor = () => {
    return isDark ? '#D1D5DB' : '#4B5563';
  };

  const ErrorIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ color: getIconColor() }}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  const RetryButton = () => {
    if (!showRetryButton || !onRetry) return null;

    return (
      <button
        onClick={onRetry}
        className="
          px-4 py-2 bg-primary text-white rounded-md 
          transition-colors duration-200 font-medium
          hover:bg-primary/90 
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
          active:bg-primary/80
        "
        aria-label="Retry loading chart data"
      >
        Try Again
      </button>
    );
  };

  return (
    <div className={getOverlayClasses()} role="alert">
      <div className={getCardClasses()}>
        <ErrorIcon />

        <h3
          className="font-medium mb-2 text-center"
          style={{ color: getTitleColor() }}
        >
          {title}
        </h3>

        <p
          className="text-sm mb-4 text-center"
          style={{ color: getTextColor() }}
        >
          {getErrorMessage()}
        </p>

        <RetryButton />
      </div>
    </div>
  );
};

export default React.memo(ChartErrorOverlay);
