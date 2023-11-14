import React from 'react';

const circleTick = ({ width, height, fill }) => {
  return (
    <svg
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <g id='check-circle-broken'>
        <path
          id='Icon'
          d='M18.3307 9.2355V10.0022C18.3297 11.7992 17.7478 13.5477 16.6718 14.987C15.5959 16.4263 14.0835 17.4792 12.3602 17.9888C10.6369 18.4983 8.79511 18.4371 7.10945 17.8143C5.4238 17.1916 3.98461 16.0406 3.00653 14.5331C2.02845 13.0255 1.56389 11.2422 1.68213 9.44909C1.80036 7.65597 2.49507 5.9491 3.66263 4.58306C4.83019 3.21702 6.40805 2.26498 8.16089 1.86895C9.91372 1.47292 11.7476 1.65411 13.3891 2.3855M18.3307 3.33073L9.9974 11.6724L7.4974 9.1724'
          stroke={fill || 'white'}
          strokeWidth='1.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  );
};

export default circleTick;
