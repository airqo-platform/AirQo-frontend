import React from 'react';
import HeaderNav from '../../common/components/Collocation/header';
import Layout from '../../common/components/Layout';
import Collocate from '@/icons/Collocation/collocate.svg';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';
import UploadIcon from '@/icons/Actions/upload.svg';

const collocate = () => {
  return (
    <Layout>
      <HeaderNav component={'Collocate'} />
      <div className='mx-6 border-2 rounded-lg border-slate-100 flex justify-center items-center'>
        <div className='flex justify-center items-center flex-col py-20'>
          <Collocate />
          <div className='flex flex-col justify-center text-center mt-10'>
            <h4 className='text-xl font-normal mb-6'>
              This is where you’ll manage your collocated monitors
            </h4>
            <div>
              <p className='text-grey-300 text-sm font-light'>
                You can add a monitor to start collocation or import your own
                data
              </p>
            </div>
            <div className='flex justify-evenly items-center mt-6'>
              <button className='flex justify-center items-center btn btn-blue normal-case gap-2 rounded-none bg-blue border-transparent hover:bg-light-blue'>
                <BoxedAddIcon />
                Test monitor
              </button>
              <button className='flex justify-center items-center btn btn-disabled normal-case gap-2 rounded-none'>
                <UploadIcon />
                Import data
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default collocate;
