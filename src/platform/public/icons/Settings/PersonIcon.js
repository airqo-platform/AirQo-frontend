import React from 'react';

export default function PersonIcon({ width, height, fill }) {
  return (
    <svg
      width={width || 28}
      height={height || 29}
      viewBox="0 0 28 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 23.833c2.725-2.89 6.425-4.666 10.5-4.666s7.775 1.776 10.5 4.666M19.25 9.25a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
        stroke={fill || '#145FFF'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
