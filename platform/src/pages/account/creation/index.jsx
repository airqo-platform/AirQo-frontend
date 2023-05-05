import React from 'react';
import AccountPageLayout from '../../../common/components/Account/Layout';
import GoogleLogo from '@/icons/Common/google_logo.svg';
import Link from 'next/link';

const AccountCreation = () => {
  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Lets get started</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Get access to air quality analytics across Africa
        </p>
        <div className='mt-6'>
          <div className='w-full'>
            <div className='text-xs'>Email address*</div>
            <div className='mt-2 w-full'>
              <input
                type='email'
                placeholder='e.g. greta.nagawa@gmail.com'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              <button className='mt-6 btn bg-blue-900 rounded-none w-full text-sm outline-none border-none hover:bg-blue-950'>
                {' '}
                Continue
              </button>
            </div>
          </div>
        </div>
        <div className='mt-6 grid grid-cols-3 items-center justify-center'>
          <span className='w-full border border-grey-200'></span>
          <span className='justify-self-center w-fit'>Or</span>
          <span className='w-full border border-grey-200'></span>
        </div>
        <div className='mt-6'>
          <button className='btn bg-form-input rounded-none w-full outline-none border-none flex flex-row items-center justify-center hover:bg-grey-200'>
            <span style={{ color: '#000000', fontWeight: '400', opacity: '0.5' }}>
              Sign up with
            </span>
            <span className='pl-2'>
              <GoogleLogo />
            </span>
          </button>
        </div>
        <div className='mt-6'>
          <span className='text-sm text-grey-300'>Already have an account?</span>
          <span className='text-sm text-blue-900 font-medium'>
            {' '}
            <Link href="/">Log in</Link>
          </span>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default AccountCreation;
