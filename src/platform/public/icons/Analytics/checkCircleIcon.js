import React from 'react';

const CheckCircleIcon = ({
  size = 20,
  strokeWidth = 1.2,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.334 9.237v.767a8.334 8.334 0 11-4.942-7.617m4.942.946L10 11.674l-2.5-2.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckCircleIcon;
