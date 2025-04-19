import React from 'react';

const fileTypeIcon = ({
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
        d="M9.334 7.834h-4m1.333 2.667H5.334m5.333-5.334H5.334m8-.133v6.933c0 1.12 0 1.68-.218 2.108a2 2 0 01-.874.874c-.428.218-.988.218-2.108.218H5.867c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874c-.218-.427-.218-.988-.218-2.108V5.034c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874c.428-.218.988-.218 2.108-.218h4.267c1.12 0 1.68 0 2.108.218a2 2 0 01.874.874c.218.428.218.988.218 2.108z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default fileTypeIcon;
