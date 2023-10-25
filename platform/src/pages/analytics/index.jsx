import React, { useState } from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './tabs/OverView';
import Explore from './tabs/Explore';
import TabButtons from '@/components/Button/TabButtons';
import CalendarIcon from '@/icons/calendar.svg';
import SettingsIcon from '@/icons/settings.svg';
import Datepicker from 'react-tailwindcss-datepicker';

const AuthenticatedHomePage = () => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const [showDatepicker, setShowDatepicker] = useState(false);

  const handleValueChange = (newValue) => {
    console.log('newValue:', newValue);
    setValue(newValue);
  };

  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex mb-2 space-x-3'>
            <TabButtons
              Icon={CalendarIcon}
              btnText='Last 7 days'
              dropdown
              onClick={() => setShowDatepicker(true)}
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
      {showDatepicker && (
        <Datepicker value={value} onChange={handleValueChange} showShortcuts={true} />
      )}
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
