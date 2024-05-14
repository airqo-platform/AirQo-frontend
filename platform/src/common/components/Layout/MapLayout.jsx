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
      <div className='w-full h-dvh overflow-hidden' data-testid='layout'>
        <div className='flex'>
          <CollapsedSidebar />

          <div className='w-full w-full h-dvh overflow-y-auto'>{children}</div>
        </div>
      </div>
    </>
  );
};

export default mapLayout;
