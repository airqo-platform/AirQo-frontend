import React from 'react';

const ContentBox = ({ children }) => {
  return (
    <div className='mx-6 mb-6 border-[0.5px] rounded-lg border-grey-150 flex justify-center items-center'>
      {children}
    </div>
  );
};

export default ContentBox;
