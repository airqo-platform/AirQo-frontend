import React, { useEffect, useState } from 'react';
import SmallLogo from '@/icons/airqo_logo.svg';
import Image from 'next/image';
import AnalyticsImage from '@/images/Account/analyticsImage.webp';
import Head from 'next/head';

const AccountPageLayout = ({
  pageTitle,
  children,
  rightText,
  childrenTop,
  sideBackgroundColor,
}) => {
  const [width, setWidth] = useState(0);
  const handleResize = () => setWidth(window.innerWidth);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  return (
    <div style={{ height: '100vh' }}>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>
      <div className="h-full w-auto">
        <div className="grid md:grid-cols-1 lg:grid-cols-11 w-full h-full ">
          <div className="lg:col-span-5 bg-white dark:bg-[#1b1d1e] py-10 px-6 lg:px-20 h-full flex justify-center items-center">
            <div className="w-full lg:w-auto">
              <div>
                <SmallLogo />
              </div>
              <div
                className={`${
                  childrenTop ? childrenTop : 'mt-16'
                } flex flex-col justify-center items-start lg:max-w-[360px]`}
              >
                {children}
              </div>
            </div>
          </div>
          <div
            className={`lg:col-span-6 lg:grid hidden ${
              sideBackgroundColor
                ? sideBackgroundColor
                : 'bg-blue-50 dark:bg-[#252627]'
            } flex items-center justify-center w-full`}
          >
            <div className="px-[64px] py-[26px] relative dark:text-white max-w-4xl h-auto">
              <h1 className="relative font-medium leading-9 text-[29px] mb-6">
                {rightText
                  ? rightText
                  : "Before joining the AirQo Analytics I spent ages trying to send emails to AirQo support to get access to air quality data. What you've built here is so much better for air pollution monitoring than anything else on the market!"}
              </h1>
              <h2 className="relative font-medium leading-9 text-[18px]">
                — Jennifer
              </h2>
              <span className="text-grey-300 text-[16px] font-normal leading-6">
                Environment officer. NEMA
              </span>
              <div className="mt-10 w-auto">
                <Image src={AnalyticsImage} alt="side image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPageLayout;
