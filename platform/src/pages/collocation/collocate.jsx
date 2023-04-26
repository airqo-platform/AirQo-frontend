import React, { useEffect } from 'react';
import HeaderNav from '@/components/Layout/header';
import Layout from '@/components/Layout';
import Collocate from '@/icons/Collocation/collocate.svg';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';
import UploadIcon from '@/icons/Actions/upload.svg';
import Button from '@/components/Button';
import ContentBox from '@/components/Layout/content_box';
import { useDispatch } from 'react-redux';
import {
  useGetDeviceStatusSummaryQuery,
  getDeviceStatusSummary,
  getRunningQueriesThunk,
} from '@/lib/store/services/collocation';
import Tabs from '@/components/Collocation/DeviceStatus/Tabs';
import Tab from '@/components/Collocation/DeviceStatus/Tabs/Tab';
import Table from '@/components/Collocation/DeviceStatus/Table';
import Toast from '@/components/Toast';
import { wrapper } from '@/lib/store';

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
  const name = context.params?.name;
  if (typeof name === 'string') {
    store.dispatch(getDeviceStatusSummary.initiate(name));
  }

  await Promise.all(store.dispatch(getRunningQueriesThunk()));

  return {
    props: {},
  };
});

const collocate = () => {
  const {
    data: data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummary = data ? data.data : [];

  const filterDevicesByStatus = (status) =>
    deviceStatusSummary.filter((device) => device.status === status);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Fetch data every 5 seconds
      refetch();
    }, 5000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [refetch]);

  return (
    <Layout>
      <HeaderNav category={'Collocation'} component={'Collocate'}>
        {isError && (
          <Toast
            type={'error'}
            timeout={20000}
            message={'Uh-oh! Devices are temporarily unavailable, but we are working to fix that'}
          />
        )}
        {deviceStatusSummary && (
          <div className='flex'>
            <Button
              className={
                'bg-white text-black-600 border border-black-600 opacity-30 hover:cursor-not-allowed font-medium text-sm'
              }>
              <div className='mr-[10px]'>
                <UploadIcon />
              </div>
              Import data
            </Button>
            <div className='mr-[14px]'></div>
            <Button
              className={
                'rounded-none text-white bg-blue-900 border border-blue-900 hover:bg-dark-blue hover:border-dark-blue font-medium text-sm'
              }
              path='/collocation/add_monitor'>
              <div className='mr-[10px]'>
                <BoxedAddIcon />
              </div>
              Test monitor
            </Button>
          </div>
        )}
      </HeaderNav>
      <ContentBox>
        {deviceStatusSummary ? (
          <div className='w-full'>
            <Tabs>
              <Tab label='All'>
                <Table collocationDevices={deviceStatusSummary} isLoading={isLoading} />
              </Tab>
              <Tab label='Passed'>
                <Table collocationDevices={filterDevicesByStatus('passed')} isLoading={isLoading} />
              </Tab>
              <Tab label='Failed'>
                <Table collocationDevices={filterDevicesByStatus('failed')} isLoading={isLoading} />
              </Tab>
              <Tab label='Running'>
                <Table
                  collocationDevices={filterDevicesByStatus('running')}
                  isLoading={isLoading}
                />
              </Tab>
              <Tab label='Scheduled'>
                <Table
                  collocationDevices={filterDevicesByStatus('scheduled')}
                  isLoading={isLoading}
                />
              </Tab>
            </Tabs>
          </div>
        ) : (
          <div
            className='flex justify-center items-center flex-col mx-auto py-20'
            data-testid='collocate-empty-state'>
            <Collocate />
            <div className='flex flex-col justify-center text-center mt-10'>
              <h4 className='text-xl font-normal mb-6'>
                This is where you will manage your collocated monitors
              </h4>
              <div>
                <p className='text-grey-300 text-sm font-light'>
                  You can add a monitor to start collocation or import your own data
                </p>
              </div>
              <div className='flex justify-center items-center mt-6'>
                <Button
                  className={
                    'rounded-none text-white bg-blue-900 border border-blue-900 hover:bg-dark-blue hover:border-dark-blue font-medium'
                  }
                  path='/collocation/add_monitor'>
                  <div className='mr-[10px]'>
                    <BoxedAddIcon />
                  </div>
                  Test monitor
                </Button>
                <div className='mr-[14px]'></div>
                <Button
                  className={
                    'bg-white text-black-600 border border-black-600 opacity-30 hover:cursor-not-allowed font-medium'
                  }>
                  <div className='mr-[10px]'>
                    <UploadIcon />
                  </div>
                  Import data
                </Button>
              </div>
            </div>
          </div>
        )}
      </ContentBox>
    </Layout>
  );
};

export default collocate;
