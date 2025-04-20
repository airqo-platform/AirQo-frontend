import React from 'react';

const frequencyIcon = ({
  size = 16,
  strokeWidth = 1.6,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 17"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M15.133 8.167L13.8 9.5l-1.333-1.333m1.496 1a6 6 0 10-1.297 3.105M8 5.167V8.5l2 1.333"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default frequencyIcon;
