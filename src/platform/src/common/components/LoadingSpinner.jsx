'use client';

import PropTypes from 'prop-types';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';

export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  className = '',
}) {
  const { primaryColor } = useThemeSafe();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="SecondaryMainloader"
        aria-label="Loading"
        style={{
          '--color-primary': primaryColor,
        }}
      ></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  text: PropTypes.string,
  className: PropTypes.string,
};
