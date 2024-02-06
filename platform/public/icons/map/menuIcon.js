import React from 'react';

const menuIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'>
      <path
        d='M3 12H21M3 6H21M3 18H15'
        stroke={fill || '#536A87'}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default menuIcon;
