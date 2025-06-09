import React from 'react';

export default function PersonIcon({
  width,
  height,
  fill,
  strokeWidth = 1.5,
  className = '',
  ...props
}) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.316 18.438A4.001 4.001 0 018 16h6a4.001 4.001 0 013.684 2.438M15 8.5a4 4 0 11-8 0 4 4 0 018 0zm6 2.5c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1s10 4.477 10 10z"
        stroke={fill || 'currentColor'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
