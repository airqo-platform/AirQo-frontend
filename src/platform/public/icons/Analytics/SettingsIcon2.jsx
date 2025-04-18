import * as React from 'react';

function SettingsIcon2({
  size = 16,
  strokeWidth = 1.2,
  className = '',
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.5 5.336h8m0 0a2 2 0 104 0 2 2 0 00-4 0zm-4 5.333h8m-8 0a2 2 0 11-4 0 2 2 0 014 0z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SettingsIcon2;
