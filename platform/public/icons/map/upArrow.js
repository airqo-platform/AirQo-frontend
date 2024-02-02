import React from 'react';

const upArrow = ({ width, height, fill }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'>
      <path
        d='M18 15L12 9L6 15'
        stroke={fill || '#536A87'}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default upArrow;
