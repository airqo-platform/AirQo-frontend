import React from 'react';

export default function LogoutIcon({ width, height, fill }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || 24}
      height={height || 24}
      viewBox='0 0 24 24'
      fill='none'>
      <path
        d='M16 17l5-5m0 0l-5-5m5 5H9m0-9H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 21 6.12 21 7.8 21H9'
        stroke={fill || '#536A87'}
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
