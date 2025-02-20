import React from 'react';

const LocationIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 20}
      height={height || 20}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke={fill || '#9EA3AA'}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.333c3.333-3.334 6.666-6.318 6.666-10a6.667 6.667 0 10-13.333 0c0 3.682 3.333 6.666 6.667 10z"
        stroke={fill || '#9EA3AA'}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LocationIcon;
