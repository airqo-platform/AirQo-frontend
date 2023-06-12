import Link from 'next/link';
import React from 'react';
import ArrowLeft from '@/icons/Common/arrowLeft.svg';
import { useRouter } from 'next/router';

const NavigationBreadCrumb = ({ navTitle, children }) => {
  const router = useRouter();
  return (
    <div className='px-6 py-8 flex flex-row justify-between items-center'>
      <div>
        <span onClick={() => router.back()}>
          <button className='btn btn-sm btn-square btn-outline mr-4 border-grey-150 hover:bg-transparent'>
            <ArrowLeft />
          </button>
        </span>
        <span className='text-xl font-semibold'>{navTitle}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default NavigationBreadCrumb;
