import React from 'react';
import HeaderNav from '@/components/Collocation/header';
import Layout from '@/components/Layout';
import Collocate from '@/icons/Collocation/collocate.svg';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';
import UploadIcon from '@/icons/Actions/upload.svg';
import Button from '@/components/Button';
import ContentBox from '@/components/Layout/content_box';
import { useDispatch } from 'react-redux';
import { useGetDeviceStatusSummaryQuery } from '@/lib/store/services/collocation';
import Tabs from '@/components/Collocation/DeviceStatus/Tabs';
import Tab from '@/components/Collocation/DeviceStatus/Tabs/Tab';
import Table from '@/components/Collocation/DeviceStatus/Table';
import Toast from '@/components/Toast';

const collocate = () => {
  const dispatch = useDispatch();
  const { data: data, isLoading, isSuccess, isError, error } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummary = data ? data.data : [];

  const filterDevicesByStatus = (status) =>
    deviceStatusSummary.filter((device) => device.status === status);

  return (
    <Layout>
      <HeaderNav component={'Collocate'}>
        {isError && (
          <Toast
            type={'error'}
            message={'Uh-oh! Devices are temporarily unavailable, but we are working to fix that'}
          />
        )}
        {deviceStatusSummary && (
          <div className='flex'>
            <Button
              className={
                'bg-white text-black-600 border border-black-600 opacity-30 hover:cursor-not-allowed font-medium text-sm'
              }
            >
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
              path='/collocation/add_monitor'
            >
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
          <div className='flex justify-center items-center flex-col mx-auto py-20'>
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
                  path='/collocation/add_monitor'
                >
                  <div className='mr-[10px]'>
                    <BoxedAddIcon />
                  </div>
                  Test monitor
                </Button>
                <div className='mr-[14px]'></div>
                <Button
                  className={
                    'bg-white text-black-600 border border-black-600 opacity-30 hover:cursor-not-allowed font-medium'
                  }
                >
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
