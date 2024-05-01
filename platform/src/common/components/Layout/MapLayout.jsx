import React from 'react';
import CollapsedSidebar from '@/components/SideBar/CollapsedSidebar';
import Head from 'next/head';

const mapLayout = ({ pageTitle = 'AirQo Analytics', children, topbarTitle, noBorderBottom }) => {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property='og:title' content={pageTitle} key='title' />
      </Head>
      <div className=' w-screen h-screen  overflow-x-hidden' data-testid='layout'>
        <div className='flex w-screen h-screen'>
          <div>
            <CollapsedSidebar />
          </div>
          <div className='w-full overflow-x-hidden'>{children}</div>
        </div>
      </div>
    </>
  );
};

export default mapLayout;
