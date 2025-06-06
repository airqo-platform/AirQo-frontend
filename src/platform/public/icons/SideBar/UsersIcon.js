import React from 'react';

const UsersIcon = ({
  size = 24,
  strokeWidth = 1.5,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 20"
      fill="none"
      className={`inline-block ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 19v-2a4.002 4.002 0 00-3-3.874M14.5 1.291a4.001 4.001 0 010 7.418M16 19c0-1.864 0-2.796-.305-3.53a4 4 0 00-2.164-2.165C12.796 13 11.864 13 10 13H7c-1.864 0-2.796 0-3.53.305a4 4 0 00-2.166 2.164C1 16.204 1 17.136 1 19M12.5 5a4 4 0 11-8 0 4 4 0 018 0z"
        stroke="#1C1D20"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UsersIcon;
