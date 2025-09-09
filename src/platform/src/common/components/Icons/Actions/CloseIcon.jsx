import React from 'react';

const CloseIcon = ({
  width = 24,
  height = 24,
  fill = '#536A87',
  className,
  strokeWidth = 1.5,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke={fill}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CloseIcon;
