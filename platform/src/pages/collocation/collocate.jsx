import React from 'react';
import HeaderNav from '../../common/components/Collocation/header';
import Layout from '../../common/components/Layout';
import Collocate from '@/icons/Collocation/collocate.svg';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';
import UploadIcon from '@/icons/Actions/upload.svg';
import Button from '../../common/components/Button';
import ContentBox from '../../common/components/Layout/content_box';

const collocate = () => {
  return (
    <Layout>
      <HeaderNav component={'Collocate'} />
      <ContentBox>
        <div className='flex justify-center items-center flex-col py-20'>
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
      </ContentBox>
    </Layout>
  );
};

export default collocate;
