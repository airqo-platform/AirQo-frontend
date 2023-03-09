import React from 'react';
import HeaderNav from '@/components/Collocation/header';
import Layout from '@/components/Layout';
import Collocate from '@/icons/Collocation/collocate.svg';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';
import UploadIcon from '@/icons/Actions/upload.svg';
import Button from '@/components/Button';
import ContentBox from '@/components/Layout/content_box';
import { useDispatch } from 'react-redux';
import { useGetDeviceStatusSummaryQuery } from '../../lib/store/services/collocation';
import Tabs from '@/components/Collocation/DeviceStatus/Tabs';
import Tab from '@/components/Collocation/DeviceStatus/Tabs/Tab';
import Table from '@/components/Collocation/DeviceStatus/Table';
import collocationDataSlice from '../../lib/store/services/collocation/collocationDataSlice';

const collocate = () => {
  const dispatch = useDispatch();
  const {
    data: data,
    isLoading,
    // isSuccess,
    isError,
    error,
  } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummary = data ? data.data : [];

  return (
    <Layout>
      <HeaderNav component={'Collocate'}>
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
                'rounded-none text-white bg-blue border border-blue hover:bg-dark-blue hover:border-dark-blue font-medium text-sm'
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
                <Table collocationDevices={deviceStatusSummary} />
              </Tab>
              <Tab label='Passed'>I am the second tab</Tab>
              <Tab label='Failed'>I am the third tab</Tab>
              <Tab label='Running'>I am the third tab</Tab>
              <Tab label='Scheduled'>I am the third tab</Tab>
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
                    'rounded-none text-white bg-blue border border-blue hover:bg-dark-blue hover:border-dark-blue font-medium'
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
                    'bg-white text-[#1C1B1F] border border-[#20222333] opacity-30 hover:cursor-not-allowed font-medium'
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
