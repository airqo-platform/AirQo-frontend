'use client';

import PropTypes from 'prop-types';
import { AqLoading01 } from '@airqo/icons-react';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';

export default function LoadingSpinner({
  text = 'Loading...',
  className = '',
  useDefaultLoader = true,
  size = null,
}) {
  const { primaryColor } = useThemeSafe();

  // Default loader (custom CSS-based spinner)
  const renderDefaultLoader = () => {
    const style = {
      '--color-primary': primaryColor,
    };

    // Only apply size if provided
    if (size) {
      style.width = `${size}px`;
      style.height = `${size}px`;
    }

    return (
      <div className="SecondaryMainloader" aria-label="Loading" style={style} />
    );
  };

  // Custom loader using AqLoading01 icon
  const renderCustomLoader = () => {
    const style = {
      color: primaryColor,
    };

    // Only apply size if provided
    if (size) {
      style.width = `${size}px`;
      style.height = `${size}px`;
    }

    return <AqLoading01 className="animate-spin" style={style} />;
  };

  // Calculate text size based on spinner size
  const getTextSize = () => {
    if (!size) return 'text-sm'; // Default text size when no size specified
    if (size < 20) return 'text-xs';
    if (size < 32) return 'text-sm';
    if (size < 48) return 'text-base';
    return 'text-lg';
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {useDefaultLoader ? renderDefaultLoader() : renderCustomLoader()}
      {text && (
        <p className={`mt-2 text-gray-600 animate-pulse ${getTextSize()}`}>
          {text}
        </p>
      )}
    </div>
  );
}

LoadingSpinner.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  useDefaultLoader: PropTypes.bool,
  size: PropTypes.number,
};
