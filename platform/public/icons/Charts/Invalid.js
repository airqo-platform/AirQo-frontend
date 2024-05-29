import React from 'react';

const Invalid = ({ width, height }) => {
  return (
    <svg
      width={width || '97'}
      height={height || '96'}
      viewBox='0 0 43 43'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx={21.4858} cy={21.6309} r={21.2934} fill='#E1E7EC' />
      <circle
        cx={16.9448}
        cy={17.6562}
        r={2.5552}
        transform='rotate(180 16.945 17.656)'
        fill='#C6D1DB'
      />
      <path fill='#C6D1DB' d='M18.0801 24.4701H24.893980000000003V27.877039999999997H18.0801z' />
      <circle
        cx={25.853}
        cy={17.6562}
        r={2.5552}
        transform='rotate(180 25.853 17.656)'
        fill='#C6D1DB'
      />
      <path
        d='M24.541 5.722a16.263 16.263 0 11-5.709-.043l.547 3.207a13.01 13.01 0 104.567.034l.595-3.198z'
        fill='#fff'
      />
    </svg>
  );
};

export default Invalid;
