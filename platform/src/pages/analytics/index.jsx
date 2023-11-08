import React, { useState } from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './tabs/OverView';
import Explore from './tabs/Explore';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import Button from '@/components/Button';
import SettingsIcon from '@/icons/settings.svg';
import DownloadIcon from '@/icons/Common/download.svg';
import { useWindowSize } from '@/lib/windowSize';

const AuthenticatedHomePage = () => {
  const isMobile = useWindowSize().width < 500;
  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex space-x-3 mb-2'>
            <CustomCalendar
              initialStartDate={new Date()}
              initialEndDate={new Date()}
              id='datePicker1'
              position='down'
              className='left-[60px] md:right-0 lg:right-0'
              dropdown
            />
            <Button variant='outlined' className='text-sm font-medium' Icon={SettingsIcon}>
              Customize
            </Button>
          </div>
        ),
      },
      {
        label: 'Explore',
        children: (
          <div className='flex space-x-3 mb-3'>
            <Button className='text-sm font-medium capitalize' variant='outlined'>
              Print
            </Button>
            <Button className='text-sm font-medium capitalize' variant='filled' Icon={DownloadIcon}>
              Export
            </Button>
          </div>
        ),
      },
    ];
  };
  return (
    <Layout topbarTitle={'Analytics'} noBorderBottom>
      <div className='pt-2'>
        <Tabs childrenRight={!isMobile && renderChildrenRight()}>
          <Tab label='Overview'>
            {isMobile && (
              <div className='flex justify-end px-3 lg:px-16'>
                {renderChildrenRight()[0].children}
              </div>
            )}
            <OverView />
          </Tab>
          <Tab label='Explore'>
            {isMobile && (
              <div className='flex justify-end px-3 lg:px-16'>
                {renderChildrenRight()[1].children}
              </div>
            )}
            <Explore />
          </Tab>
        </Tabs>
      </div>
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
