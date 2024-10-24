import React from 'react';

const longArrowLeft = ({ className, fill, height, width }) => {
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
        d="M20 12H4m0 0l6 6m-6-6l6-6"
        stroke="#1C1D20"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default longArrowLeft;
