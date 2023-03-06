import React from 'react';
import HeaderNav from '../../common/components/Collocation/header';
import Layout from '../../common/components/Layout';
import CollocationSuccessImg from '@/icons/Collocation/collocate_success.svg';
import Link from 'next/link';

const CollocationSuccess = () => {
  return (
    <Layout>
      <HeaderNav component={'Overview'} />
      <div className='mx-6 mb-6 flex justify-center items-center'>
        <div className='flex justify-center items-center flex-col py-28'>
          <CollocationSuccessImg />
          <div className='flex flex-col justify-center text-center mt-10'>
            <h4 className='text-xl font-normal mb-6'>Great Job!</h4>
            <div>
              <p className='text-grey-300 text-sm font-light max-w-96'>
                You’ve successfully scheduled your first device for collocation
              </p>
              <Link href='/collocation/collocate'>
                <p>View device status, here {'-->'}</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollocationSuccess;
