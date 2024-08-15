import React from 'react';

const BorderlessContentBox = ({ children }) => {
  return <div className="px-4 md:px-6 lg:px-10 pb-3">{children}</div>;
};

export default BorderlessContentBox;
