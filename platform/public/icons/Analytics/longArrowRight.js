import React from 'react';

const longArrowRight = ({ className, fill, height, width }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 24}
      height={height || 24}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 12h16m0 0l-6-6m6 6l-6 6"
        stroke={fill || '#1C1D20'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default longArrowRight;
