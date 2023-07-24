import React from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import illustration from '@/icons/Home/illustration.jpg';
import Image from 'next/image';
import withAuth from '@/core/utils/protectedRoute';

const AuthenticatedHomePage = () => {
  return (
    <AuthenticatedLayout>
      <section>
        <div className='flex p-4 flex-row gap-4 self-stretch rounded-lg border border-gray-100 bg-white mt-6 mx-12 '>
          <div className='flex flex-col items-start gap-4'>
            <div className='flex items-center pt-12 w-303 h-92 '>
              <div
                className=' flex items-center justify-center border border-gray-100 '
                style={{ width: '303px', height: '92px' }}>
                Welcome to AirQo Analytics
              </div>
            </div>
          </div>
          <div className='flex flex-1 flex-col items-start justify-end'>
            <div className='flex items-start ml-auto '>
              <Image src={illustration} alt='Home' width='450px' height='216px' />
            </div>
          </div>
        </div>
      </section>
    </AuthenticatedLayout>
  );
};

export default withAuth(AuthenticatedHomePage);
