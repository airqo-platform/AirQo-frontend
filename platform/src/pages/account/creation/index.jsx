import React, { useState } from 'react';
import AccountPageLayout from '../../../common/components/Account/Layout';
import GoogleLogo from '@/icons/Common/google_logo.svg';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setUserEmail } from '@/lib/store/services/account/CreationSlice';
import { useRouter } from 'next/router';

const AccountCreation = () => {
  const [email, setEmail] = useState();
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const userData = useSelector((state) => state.account.userData);

  const handleChange = () => {
    dispatch(setUserEmail(email));
    router.push('/account/creation/step2');
    // if (userData.success) router.push('/account/creation/step2');
    // else setError(true);
  };

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
                onChange={(e) => setEmail(e.target.value)}
                type='email'
                placeholder='e.g. greta.nagawa@gmail.com'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              {error && <div className='text-xs text-red-600 py-2'>This email is already in use!</div>}
              <button
                className='mt-6 btn bg-blue-900 rounded-none w-full text-sm outline-none border-none hover:bg-blue-950'
                onClick={() => handleChange()}>
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
            <Link href='/'>Log in</Link>
          </span>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default AccountCreation;
