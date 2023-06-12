import React from 'react';

const HeaderNav = ({ category, component, children }) => {
  return (
    <div className='px-6 py-8 flex justify-between items-center'>
      <div>
        <span className='text-xl opacity-50 mr-4'>{category}</span>
        <span className='font-mono opacity-10 text-xl mr-4'>{'>'}</span>
        <span className='text-xl font-semibold'>{component}</span>
      </div>
      <>{children}</>
    </div>
  );
};

export default HeaderNav;
