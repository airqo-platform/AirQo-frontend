import React from 'react';

const downloadIcon = ({ width, height, color }) => {
  return (
    <svg
      width={width || 24}
      height={height || 25}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21.5H3m15-10l-6 6m0 0l-6-6m6 6v-14"
        stroke={color || '#000000'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default downloadIcon;
