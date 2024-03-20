import React from 'react';

const UnhealthySen = ({ width, height, fill }) => {
  return (
    <svg
      width={width || '800px'}
      height={height || '800px'}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`.cls-1{fill:${fill || '#2e2f42'}}`}</style>
      </defs>
      <g data-name="Layer 2" id="Layer_2">
        <g id="Export">
          <path
            className="cls-1"
            d="M64 3A61 61 0 113 64 61.06 61.06 0 0164 3m0-3a64 64 0 1064 64A64 64 0 0064 0z"
          />
          <path
            className="cls-1"
            d="M90.09 56.8H81a1.5 1.5 0 010-3h9a1.5 1.5 0 010 3zM47 56.8h-9.09a1.5 1.5 0 010-3H47a1.5 1.5 0 010 3zM86.26 87.76H41.74a1.5 1.5 0 110-3h44.52a1.5 1.5 0 010 3z"
          />
        </g>
      </g>
    </svg>
  );
};

export default UnhealthySen;
