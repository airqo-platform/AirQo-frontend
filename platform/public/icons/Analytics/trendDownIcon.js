import React from 'react';

const trendDownIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 14}
      height={height || 14}
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M12.833 9.916l-4.59-4.59c-.23-.23-.346-.346-.48-.39a.583.583 0 00-.36 0c-.133.044-.249.16-.48.39L5.327 6.923c-.231.231-.347.347-.48.39a.583.583 0 01-.36 0c-.134-.043-.25-.159-.48-.39l-2.84-2.84m11.666 5.833H8.75m4.083 0V5.833"
        stroke={fill || '#12B76A'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default trendDownIcon;
