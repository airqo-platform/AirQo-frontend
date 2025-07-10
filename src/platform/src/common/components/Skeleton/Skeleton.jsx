import React from 'react';

/**
 * Base Skeleton component for loading states
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.width - Width of the skeleton
 * @param {string} props.height - Height of the skeleton
 * @param {boolean} props.circle - Whether to render as a circle
 * @param {React.ReactNode} props.children - Child elements
 */
const Skeleton = ({
  className = '',
  width,
  height,
  circle = false,
  children,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  const shapeClasses = circle ? 'rounded-full' : 'rounded';

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default Skeleton;
