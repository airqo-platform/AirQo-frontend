import React from 'react';
import HeaderNav from '../../common/components/Collocation/header';
import Layout from '../../common/components/Layout';
import CollocationNone from '@/icons/Collocation/overview.svg';

const CollocationOverview = () => {
  return (
    <Layout>
      <HeaderNav component={'Overview'} />
      <div
        className='mx-6 mb-6 border-[0.5px] rounded-lg border-[#363A4429]
 flex justify-center items-center'
      >
        <div className='flex justify-center items-center flex-col py-28'>
          <CollocationNone />
          <div className='flex flex-col justify-center text-center mt-10'>
            <h4 className='text-xl font-normal mb-6'>You have no devices under collocation</h4>
            <div>
              <p className='text-grey-300 text-sm font-light max-w-96'>
                This is where youll find quick highlights of your collocated monitors
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollocationOverview;
