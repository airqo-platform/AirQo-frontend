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
    <div className='grid grid-cols-account'>
      <div className='col-start-2 col-end-3 grid md:grid-cols-1 lg:grid-cols-11 grid-rows-1 w-full  max-h-[800px]'>
        <div className='lg:col-span-5 lg:py-10 lg:px-20 py-8 px-6 h-max'>
          <div>
            <SmallLogo />
          </div>
          <div
            className={`${
              childrenTop ? childrenTop : 'mt-16'
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
            } flex items-center justify-center max-h-[900px] relative overflow-hidden`}>
            <Image src={rightImage ? rightImage : SideImage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPageLayout;
