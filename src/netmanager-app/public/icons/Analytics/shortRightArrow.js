import React from 'react';

const shortRightArrow = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 16}
      height={height || 16}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M6 12l4-4-4-4"
        stroke={fill || '#4B4E56'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default shortRightArrow;
