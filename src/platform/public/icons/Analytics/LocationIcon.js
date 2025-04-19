import React from 'react';

const LocationIcon = ({
  size = 16,
  strokeWidth = 1.2,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.333c3.333-3.334 6.666-6.318 6.666-10a6.667 6.667 0 10-13.333 0c0 3.682 3.333 6.666 6.667 10z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LocationIcon;
