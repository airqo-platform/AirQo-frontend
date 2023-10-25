import React from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './tabs/OverView';
import TabButtons from '@/components/Button/TabButtons';
import CalendarIcon from '@/icons/calendar.svg';
import SettingsIcon from '@/icons/settings.svg';

const AuthenticatedHomePage = () => {
  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex mb-2'>
            <TabButtons Icon={CalendarIcon} btnText='Last 7 days' dropdown />
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
        <Tab label='Explore'>{/* content goes here */}</Tab>
      </Tabs>
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
