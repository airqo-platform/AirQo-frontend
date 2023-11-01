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
import CustomiseLocationsComponent from '@/components/Customise';

const AuthenticatedHomePage = () => {
  const [customise, setCustomise] = useState(false);

  const toggleCustomise = () => {
    customise ? setCustomise(false) : setCustomise(true);
  };
  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex space-x-3 mt-2 md:mt-0 lg:mt-0'>
            <CustomCalendar
              initialStartDate={new Date()}
              initialEndDate={new Date()}
              id='datePicker'
              position={
                window.innerWidth <= 768
                  ? { top: '40px', left: '0px' }
                  : { top: '40px', right: '0px' }
              }
              dropdown
            />
            <TabButtons Icon={SettingsIcon} btnText='Customize' onClick={() => toggleCustomise()} />
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
      {customise && <CustomiseLocationsComponent toggleCustomise={toggleCustomise} />}
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
