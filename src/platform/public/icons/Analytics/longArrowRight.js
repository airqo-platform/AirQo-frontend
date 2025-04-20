import React from 'react';

const longArrowRight = ({
  size = 24,
  strokeWidth = 1.3,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      className={className}
    >
      <path
        d="M4 12h16m0 0l-6-6m6 6l-6 6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default longArrowRight;
