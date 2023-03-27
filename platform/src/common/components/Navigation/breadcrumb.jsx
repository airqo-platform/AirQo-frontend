import Link from 'next/link';
import React from 'react';
import ArrowLeft from '@/icons/Common/arrowLeft.svg';

const NavigationBreadCrumb = ({ backLink, navTitle, children }) => {
  return (
    <div className='px-6 py-8 flex flex-row justify-between items-center'>
      <div>
        <Link href={backLink}>
          <button className='btn btn-sm btn-square btn-outline mr-4 border-grey-150 hover:bg-transparent'>
            <ArrowLeft />
          </button>
        </Link>
        <span className='text-xl font-semibold'>{navTitle}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default NavigationBreadCrumb;
