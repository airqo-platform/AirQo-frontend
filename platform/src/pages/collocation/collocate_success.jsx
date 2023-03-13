import React from 'react';
import HeaderNav from '../../common/components/Collocation/header';
import Layout from '../../common/components/Layout';
import CollocationSuccessImg from '@/icons/Collocation/collocate_success.svg';
import Link from 'next/link';
import ContentLessTopBar from '../../common/components/TopBar/content_less_header';

const CollocationSuccess = () => {
  return (
    <>
      <ContentLessTopBar />
      <div className='flex justify-center items-center mx-6'>
        <div className='flex justify-center items-center flex-col py-28'>
          <CollocationSuccessImg />
          <div className='flex flex-col justify-center text-center mt-10'>
            <h4 className='text-[32px] font-medium mb-3 text-black-600'>Great Job!</h4>
            <div>
              <p className='text-grey-300 text-xl max-w-md mb-8'>
                You’ve successfully scheduled your first device for collocation
              </p>
              <Link href='/collocation/collocate'>
                <p className='text-blue text-xl cursor-pointer'>View device status, here {'-->'}</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollocationSuccess;
