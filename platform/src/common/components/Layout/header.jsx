import React from 'react';

const HeaderNav = ({ category, component }) => {
  return (
    <div className='px-6 py-8'>
      <span className='text-xl opacity-50 mr-4'>{category}</span>
      <span className='font-mono opacity-10 text-xl mr-4'>{'>'}</span>
      <span className='text-xl font-semibold'>{component}</span>
    </div>
  );
};

export default HeaderNav;
