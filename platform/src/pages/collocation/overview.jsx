import React from 'react';
import HeaderNav from '@/components/Layout/header';
import Layout from '@/components/Layout';
import CollocationNone from '@/icons/Collocation/overview.svg';
import ContentBox from '@/components/Layout/content_box';
import { format } from 'date-fns';
import GraphCard from '../../common/components/Collocation/AddMonitor/Overview/graph_card';

const CollocationOverview = () => {
  return (
    <Layout>
      <HeaderNav category={'Collocation'} component={'Overview'} />
      <ContentBox>
        <div className='grid grid-cols-1 divide-y divide-grey-150'>
          <div className='md:p-6 p-4'>
            <h5 className='font-semibold text-lg'>Today</h5>
            <p className='text-base font-normal opacity-40'>{format(new Date(), 'MMM dd, yyyy')}</p>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 divide-x divide-grey-150'>
            <GraphCard deviceName={'AQG502'} />
            <GraphCard deviceName={'AQG503'} secondGraph={true} />
          </div>
          <div className='divide-y pt-20'>
            <div className='flex flex-row items-center justify-between p-7 md:px-12'>
              <span className='font-normal text-base opacity-60'>Monitor name</span>
              <span className='font-normal text-base opacity-60 text-left'>End date</span>
            </div>
            <div className='flex flex-row items-center justify-between p-7 md:px-12'>
              <span className='font-semibold text-base flex justify-between items-center'>
                AQG502
              </span>
              <span className='text-xl font-normal'>{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
            <div className='flex flex-row items-center justify-between p-7 md:px-12'>
              <span className='font-semibold text-base flex justify-between items-center'>
                AQG502
              </span>
              <span className='text-xl font-normal'>{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
      </ContentBox>
      {/* NO DEVICES COMPONENT */}
      {/* <ContentBox>
        <div className='flex justify-center items-center flex-col mx-auto py-28'>
          <CollocationNone />
          <div className='flex flex-col justify-center text-center mt-10'>
            <h4 className='text-xl font-normal mb-6'>You have no devices under collocation</h4>
            <div>
              <p className='text-grey-300 text-sm font-light max-w-96'>
                This is where you'll find quick highlights of your collocated monitors
              </p>
            </div>
          </div>
        </div>
      </ContentBox> */}
    </Layout>
  );
};

export default CollocationOverview;
