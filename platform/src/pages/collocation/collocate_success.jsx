import React from 'react';
import CollocationSuccessImg from '@/icons/Collocation/collocate_success.svg';
import Link from 'next/link';
import ContentLessTopBar from '@/components/TopBar/content_less_header';
import Button from '@/components/Button';

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
              <Button
                path='/collocation/collocate'
                className='text-blue-900 text-xl cursor-pointer'
                dataTestId='collocation-view-device-status-button'
              >
                View device status, here {'-->'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollocationSuccess;
