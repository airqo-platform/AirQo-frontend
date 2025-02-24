import React from 'react';

const chevron_downIcon = ({ width, height, fill, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 16}
      height={height || 17}
      viewBox="0 0 16 17"
      fill="none"
      className={className}
    >
      <path
        d="M4 6.5l4 4 4-4"
        stroke={fill || '#1C1D20'}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default chevron_downIcon;
