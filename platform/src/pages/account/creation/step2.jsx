import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/lib/store/services/account/CreationSlice';
import {
  setUserFirstName,
  setUserLastName,
  setUserPassword,
} from '@/lib/store/services/account/CreationSlice';
import { useRouter } from 'next/router';

const AccountCreationPage2 = () => {
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [password, setPassword] = useState();

  const dispatch = useDispatch();
  const router = useRouter();
  const userEmail = useSelector((state) => state.creation.userData.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setUserFirstName(firstName));
    dispatch(setUserLastName(lastName));
    dispatch(setUserPassword(password));
    try {
      await dispatch(createUser({email:userEmail, firstName, lastName}));
      router.push('/account/creation/step3');
    } catch (err) {
      return err;
    }
  };

  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Lets get started</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Get access to air quality analytics across Africa
        </p>
        <form onSubmit={handleSubmit}>
          <div className='mt-6'>
            <div className='flex flex-row justify-between'>
              <div className='w-full'>
                <div className='text-xs'>First name*</div>
                <div className='mt-2 w-11/12'>
                  <input
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    type='text'
                    placeholder='e.g. Greta'
                    className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                    required
                  />
                </div>
              </div>
              <div className='w-full'>
                <div className='text-xs'>Last name*</div>
                <div className='mt-2 w-full'>
                  <input
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    type='text'
                    placeholder='e.g. Nagawa'
                    className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='w-full'>
              <div className='text-xs'>Password*</div>
              <div className='mt-2 w-full'>
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  pattern='^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$'
                  title='Password should include an uppercase letter, lowercase letter, a number and special character(#?!@$^&)'
                  minLength={'8'}
                  maxLength={'20'}
                  type='password'
                  className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                  required
                />
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='flex flex-row items-center'>
              <div>
                <input
                  type='checkbox'
                  className='checkbox rounded border-2 border-check-box'
                  required
                />
              </div>
              <div className='ml-4'>
                <p className='text-xs'>
                  I agree to the{' '}
                  <a href='#' className='underline'>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href='#' className='underline'>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className='mt-14'>
            <div className='flex flex-col-reverse md:flex-row items-center justify-start md:justify-between'>
              <div className='w-full md:w-1/3 mt-6 lg:mt-0'>
                <Link href='/account/creation'>
                  <button className='w-full text-sm btn bg-white rounded-none outline-none border-2 border-check-box hover:bg-gray-100 hover:border-inherit focus:border-inherit'>
                    <span style={{ color: '#353E52' }}>Back</span>
                  </button>
                </Link>
              </div>
              <div className='w-full md:w-1/3'>
                <button
                  type='submit'
                  onClick={handleSubmit}
                  className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AccountPageLayout>
  );
};

export default AccountCreationPage2;
