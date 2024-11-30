import React from 'react';

const CheckCircleIcon = ({ width, height }) => {
  return (
    <svg
      width={width || 20}
      height={height || 20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.334 9.237v.767a8.334 8.334 0 11-4.942-7.617m4.942.946L10 11.674l-2.5-2.5"
        stroke="#fff"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckCircleIcon;
