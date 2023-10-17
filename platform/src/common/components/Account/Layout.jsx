import React, { useEffect, useState } from 'react';
import SmallLogo from '@/icons/airqo_logo.svg';
import Image from 'next/image';
import SideImage from '@/images/Account/SideQuote.png';

const AccountPageLayout = ({ children, rightImage, childrenTop, childrenHeight, sideBackgroundColor }) => {
  const [width, setWidth] = useState(0);
  const handleResize = () => setWidth(window.innerWidth);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  return (
    <div className='grid md:grid-cols-1 lg:grid-cols-11 w-full h-screen'>
      <div className='lg:col-span-5 lg:py-16 lg:px-20 py-8 px-6'>
        <div>
          <SmallLogo />
        </div>
        <div
          className={`${
            childrenTop ? childrenTop : 'mt-20'
          } flex flex-col justify-center items-start ${
            childrenHeight ? childrenHeight : 'lg:h-[480px]'
          } overflow-hidden`}>
          {children}
        </div>
      </div>
      {width >= 1020 && (
        <div
          className={`lg:col-span-6 ${
            sideBackgroundColor ? sideBackgroundColor : 'bg-green-150'
          } flex items-center justify-center`}>
          <Image src={rightImage ? rightImage : SideImage} />
        </div>
      )}
    </div>
  );
};

export default AccountPageLayout;
