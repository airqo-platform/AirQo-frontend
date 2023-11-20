import React, { useEffect } from 'react';
import HeaderNav from '@/components/Layout/header';
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
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import Table from '@/components/Collocation/DeviceStatus/Table';
import Toast from '@/components/Toast';
import { wrapper } from '@/lib/store';
import { isEmpty } from 'underscore';
import EmptyState from '@/components/Collocation/Collocate/empty_state';
import Layout from '@/components/Layout';
import withAuth, { withPermission } from '@/core/utils/protectedRoute';
import Head from 'next/head';

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
  try {
    const name = context.params?.name;

    if (typeof name === 'string') {
      await store.dispatch(getDeviceStatusSummary.initiate(name));
    }

    await Promise.all(store.dispatch(getDeviceStatusSummary.util.getRunningQueriesThunk()));

    const deviceStatusSummary = store.getState().collocationData.deviceStatusSummary;

    return {
      props: {
        deviceStatusSummary,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);

    return {
      props: {},
    };
  }
});

const Collocate = () => {
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
    // Fetch data every 2 minutes
    const intervalId = setInterval(() => {
      refetch();
    }, 200000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [refetch]);

  return (
    <Layout topbarTitle={'Collocation'} pageTitle={'Collocate | Collocation'}>
      <HeaderNav category={'Collocation'} component={'Collocate'}>
        {isError && (
          <Toast
            type={'error'}
            timeout={5000}
            message={'Uh-oh! Server error. Please try again later.'}
          />
        )}
        {isLoading ||
          (isSuccess && (
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
                Add monitors
              </Button>
            </div>
          ))}
      </HeaderNav>
      <ContentBox>
        {isLoading || isSuccess ? (
          <div className='w-full'>
            <Tabs>
              <Tab label='All'>
                <Table collocationDevices={deviceStatusSummary} isLoading={isLoading} />
              </Tab>
              <Tab label='Passed'>
                <Table collocationDevices={filterDevicesByStatus('PASSED')} isLoading={isLoading} />
              </Tab>
              <Tab label='Failed'>
                <Table collocationDevices={filterDevicesByStatus('FAILED')} isLoading={isLoading} />
              </Tab>
              <Tab label='Running'>
                <Table
                  collocationDevices={filterDevicesByStatus('RUNNING')}
                  isLoading={isLoading}
                />
              </Tab>
              <Tab label='Scheduled'>
                <Table
                  collocationDevices={filterDevicesByStatus('SCHEDULED')}
                  isLoading={isLoading}
                />
              </Tab>
            </Tabs>
          </div>
        ) : (
          <EmptyState />
        )}
      </ContentBox>
    </Layout>
  );
};

export default withPermission(withAuth(Collocate), 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
