import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import GoogleLogo from '@/icons/Common/google_logo.svg';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setUserEmail } from '@/lib/store/services/account/CreationSlice';
import { useRouter } from 'next/router';
import { getGoogleAuthDetails } from '@/core/apis/Account';
import RadioComponent from '@/components/Account/RadioComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';

const userRoles = ['Individual', 'Organisation'];

const UserDesignation = () => {
  const [clickedRole, setClickedRole] = useState('');
  return (
    <AccountPageLayout>
      {clickedRole === '' && (
        <div className='w-full'>
          <h2 className='text-3xl text-black-700 font-medium'>What best describes you?</h2>
          <p className='text-xl text-black-700 font-normal mt-3'>
            We will help you get started based on your response
          </p>
          <div className='mt-6'>
            <div className='w-full grid grid-cols-1 gap-y-8'>
              {userRoles.map((text, index) => (
                <div
                  key={index}
                  className='w-full'
                  onClick={() => {
                    setTimeout(() => {
                      setClickedRole(text);
                    }, 1500);
                  }}>
                  <RadioComponent text={text} width={'w-full'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {clickedRole === 'Individual' && <IndividualAccountCreation />}
    </AccountPageLayout>
  );
};

const IndividualAccountCreation = () => {
  const [email, setEmail] = useState(null);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const userData = useSelector((state) => state.creation.userData);

  const handleChange = () => {
    if (email === null || email === '') {
      setError(true);
    } else {
      dispatch(setUserEmail(email));
      router.push('/account/creation/step2');
    }
  };

  return (
    <div className='w-full'>
      <h2 className='text-3xl text-black-700 font-medium'>Lets get started</h2>
      <p className='text-xl text-black-700 font-normal mt-3'>
        Get access to air quality analytics across Africa
      </p>
      <div className='mt-6'>
        <div className='w-full'>
          <div className='text-xs'>Email address*</div>
          <div className='mt-2 w-full'>
            {error ? (
              <>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type='email'
                  placeholder='e.g. greta.nagawa@gmail.com'
                  className='input w-full h-16 rounded-lg bg-form-input border-red-600'
                  required
                />
                <div className='flex flex-row items-start text-xs text-red-600 py-2'>
                  <HintIcon className='w-8 h-8 mr-2' />
                  <span>Please provide your email address!</span>
                </div>
              </>
            ) : (
              <input
                onChange={(e) => setEmail(e.target.value)}
                type='email'
                placeholder='e.g. greta.nagawa@gmail.com'
                className='input w-full h-16 rounded-lg bg-form-input focus:border-input-outline'
                required
              />
            )}
            <button
              className='mt-6 btn bg-blue-900 rounded-none w-full text-sm outline-none border-none hover:bg-blue-950'
              onClick={() => handleChange()}>
              {' '}
              Continue
            </button>
          </div>
        </div>
      </div>
      {/* <div className='mt-6 grid grid-cols-3 items-center justify-center'>
        <span className='w-full border border-grey-200'></span>
        <span className='justify-self-center w-fit'>Or</span>
        <span className='w-full border border-grey-200'></span>
      </div>
      <div className='mt-6'>
        <button
          className='btn bg-form-input rounded-none w-full outline-none border-none flex flex-row items-center justify-center hover:bg-grey-200'
          onClick={() => {
            getGoogleAuthDetails();
          }}>
          <span style={{ color: '#000000', fontWeight: '400', opacity: '0.5' }}>Sign up with</span>
          <span className='pl-2'>
            <GoogleLogo />
          </span>
        </button>
      </div> */}
      <div className='mt-12'>
        <span className='text-sm text-grey-300'>Already have an account?</span>
        <span className='text-sm text-blue-900 font-medium'>
          {' '}
          <Link href='/account/login'>Log in</Link>
        </span>
      </div>
    </div>
  );
};

export default UserDesignation;
