import React from 'react';

const ContentBox = ({ children, noMargin }) => {
  return (
    <div
      className={`relative overflow-hidden ${
        !noMargin && 'mx-6 mb-6'
      } border-[0.5px] rounded-lg border-secondary-neutral-light-100`}
    >
      {children}
    </div>
  );
};

export default ContentBox;
