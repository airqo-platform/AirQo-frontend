import React from 'react';

const radioIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 16}
      height={height || 16}
      viewBox="0 0 16 16"
      fill="none"
    >
      <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill="#EDF6FF" />
      <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#135DFF" />
      <circle cx="7.9998" cy="8.00078" r="3.2" fill="#135DFF" />
    </svg>
  );
};

export default radioIcon;
