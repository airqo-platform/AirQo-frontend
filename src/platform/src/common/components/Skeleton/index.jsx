import React from 'react';
import cn from 'classnames';

/**
 * Unified Skeleton component for loading states
 * Replaces multiple duplicate skeleton implementations across the platform
 */
export const Skeleton = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-600 rounded';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-bounce', // could be enhanced with custom wave animation
    none: '',
  };

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const style = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height)
    style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className,
      )}
      style={style}
    />
  );
};

export default Skeleton;
