'use client';

import PropTypes from 'prop-types';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';

export default function LoadingSpinner({
  text = 'Loading...',
  className = '',
}) {
  const { primaryColor } = useThemeSafe();

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
  text: PropTypes.string,
  className: PropTypes.string,
};
