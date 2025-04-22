import React from 'react';

const plusIcon = ({ size = 24, strokeWidth = 2, className = '', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...props}
      fill="none"
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default plusIcon;
