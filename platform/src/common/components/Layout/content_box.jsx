import React from 'react';

const ContentBox = ({ children }) => {
  return (
    <div className='mx-6 mb-6 border-[0.5px] rounded-lg border-secondary-neutral-light-100'>
      {children}
    </div>
  );
};

export default ContentBox;
