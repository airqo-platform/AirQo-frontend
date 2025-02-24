import React from 'react';

const frequencyIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 16}
      height={height || 16}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M15.133 8.167L13.8 9.5l-1.333-1.333m1.496 1a6 6 0 10-1.297 3.105M8 5.167V8.5l2 1.333"
        stroke={fill || '#1C1D20'}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default frequencyIcon;
