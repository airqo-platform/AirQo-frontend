'use client';

import PropTypes from 'prop-types';
import { AqLoading02 } from '@airqo/icons-react';
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
      // Allow size to be a numeric pixel value or a token like 'sm'|'md'|'lg'
      const tokenMap = { sm: 16, md: 32, lg: 48 };
      const numericSize =
        typeof size === 'string' ? tokenMap[size] || parseInt(size, 10) : size;
      if (numericSize) {
        style.width = `${numericSize}px`;
        style.height = `${numericSize}px`;
      }
    }

    return (
      <div className="SecondaryMainloader" aria-label="Loading" style={style} />
    );
  };

  // Custom loader using AqLoading02 icon
  const renderCustomLoader = () => {
    const style = {
      color: primaryColor,
    };

    // Only apply size if provided
    if (size) {
      const tokenMap = { sm: 16, md: 32, lg: 48 };
      const numericSize =
        typeof size === 'string' ? tokenMap[size] || parseInt(size, 10) : size;
      if (numericSize) {
        style.width = `${numericSize}px`;
        style.height = `${numericSize}px`;
      }
    }

    return <AqLoading02 className="animate-spin" style={style} />;
  };

  // Calculate text size based on spinner size
  const getTextSize = () => {
    if (!size) return 'text-sm'; // Default text size when no size specified
    const tokenMap = { sm: 16, md: 32, lg: 48 };
    const numericSize =
      typeof size === 'string' ? tokenMap[size] || parseInt(size, 10) : size;
    if (!numericSize) return 'text-sm';
    if (numericSize < 20) return 'text-xs';
    if (numericSize < 32) return 'text-sm';
    if (numericSize < 48) return 'text-base';
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
  // size may be a pixel number or a token string like 'sm'|'md'|'lg'
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
