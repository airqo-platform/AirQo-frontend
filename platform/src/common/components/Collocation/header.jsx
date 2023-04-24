import React from 'react';

const HeaderNav = ({ component, children }) => {
  return (
    <div className='md:flex md:justify-between md:items-center px-6 py-8'>
      <div className='mr-3 mb-3 lg:mr-0 lg:mb-0'>
        <span className='text-xl opacity-50 mr-4'>Collocation</span>
        <span className='font-mono opacity-10 text-xl mr-4'>{'>'}</span>
        <span className='text-xl font-semibold'>{component}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default HeaderNav;
