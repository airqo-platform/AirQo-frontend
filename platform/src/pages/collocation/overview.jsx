import React from 'react';
import HeaderNav from '@/components/Collocation/header';
import Layout from '@/components/Layout';
import CollocationNone from '@/icons/Collocation/overview.svg';
import ContentBox from '@/components/Layout/content_box';

const CollocationOverview = () => {
  return (
    <Layout>
      <HeaderNav component={'Overview'} />
      <ContentBox>
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
      </ContentBox>
    </Layout>
  );
};

export default CollocationOverview;
