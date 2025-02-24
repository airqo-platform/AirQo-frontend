import React from 'react';

const EditIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 16}
      height={height || 17}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M8 13.834h6m-12 0h1.116c.326 0 .49 0 .643-.037.136-.032.266-.086.385-.16.135-.082.25-.197.48-.428L13 4.834a1.414 1.414 0 10-2-2L2.625 11.21c-.23.23-.346.346-.429.48-.073.12-.127.25-.16.386C2 12.23 2 12.392 2 12.718v1.116z"
        stroke={fill || '#1C1D20'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EditIcon;
