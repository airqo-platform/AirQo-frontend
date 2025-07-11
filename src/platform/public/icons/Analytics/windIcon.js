import React from 'react';

const windIcon = ({
  size = 16,
  strokeWidth = 1.6,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 17"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M1.333 4.5c.4.334.8.667 1.667.667 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667m-13.333 8c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667m-13.333-4c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default windIcon;
