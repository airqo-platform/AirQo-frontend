import React, { useState } from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './tabs/OverView';
import Explore from './tabs/Explore';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import TabButtons from '@/components/Button/TabButtons';
import SettingsIcon from '@/icons/settings.svg';

const AuthenticatedHomePage = () => {
  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex space-x-3 mt-2 md:mt-0 lg:mt-0 mb-2'>
            <CustomCalendar
              initialStartDate={new Date()}
              initialEndDate={new Date()}
              id='datePicker'
              position={window.innerWidth <= 768 ? { left: '60px' } : { right: '0px' }}
              dropdown
            />
            <TabButtons Icon={SettingsIcon} btnText='Customize' />
          </div>
        ),
      },
      {
        label: 'Explore',
        children: <div className='flex'>{/* code goes here */}</div>,
      },
    ];
  };
  return (
    <Layout topbarTitle={'Analytics'} noBorderBottom>
      <Tabs childrenRight={renderChildrenRight()}>
        <Tab label='Overview'>
          <OverView />
        </Tab>
        <Tab label='Explore'>
          <Explore />
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
