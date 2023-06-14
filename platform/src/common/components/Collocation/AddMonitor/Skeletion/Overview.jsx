import React from 'react';
import GraphCard from './GraphCard';

const OverviewSkeleton = () => {
  return (
    <div className='grid grid-cols-1 divide-y divide-skeleton px-6'>
      <div className='md:p-6 p-4'>
        <div className='max-w-[257px] mb-[7px] h-6 w-auto bg-skeleton rounded' />
        <div className='w-[121px] h-4 bg-skeleton rounded' />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 divide-x divide-skeleton'>
        <GraphCard />
        <GraphCard />
      </div>
      <div className='divide-y divide-skeleton pt-20 mb-6 md:mb-20'>
        <div className='flex flex-row items-center justify-between p-6 md:px-12'>
          <div className='bg-skeleton w-[121px] h-6 rounded mr-2' />
          <div className='bg-skeleton w-[121px] h-6 rounded' />
        </div>
        <div className='flex flex-row items-center justify-between p-6 md:px-12'>
          <div className='bg-skeleton w-[121px] h-6 rounded mr-2' />
          <div className='bg-skeleton w-[181px] h-6 rounded' />
        </div>
        <div className='flex flex-row items-center justify-between p-6 md:px-12'>
          <div className='bg-skeleton w-[121px] h-6 rounded mr-2' />
          <div className='bg-skeleton w-[181px] h-6 rounded' />
        </div>
      </div>
    </div>
  );
};

export default OverviewSkeleton;
