import React from 'react';
import SmallLogo from '@/icons/airqo_logo.svg';

const AccountPageLayout = ({ children, rightImage }) => {
  return (
    <div className='grid md:grid-cols-1 lg:grid-cols-9 w-full h-screen'>
      <div className='lg:col-span-4 lg:py-16 lg:px-20 py-8 px-6'>
        <div>
          <SmallLogo />
        </div>
        <div className='mt-20 flex flex-col justify-center items-start lg:h-[480px] overflow-hidden'>
          {children}
        </div>
      </div>
      <div className='lg:col-span-5 bg-emerald-200'>{rightImage}</div>
    </div>
  );
};

export default AccountPageLayout;
