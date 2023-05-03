import React, { useState } from 'react';
import AccountPageLayout from '../../../common/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '../../../lib/store/services/account/CreationSlice';

const AccountCreationPage3 = () => {
  const userData = useSelector((state) => state.account.userData);
  const errors = useSelector((state) => state.account.errors);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      const res = await dispatch(createUser(userData));
      return res;
    } catch (err) {
      console.log('An error occurred:', err);
    }
  };

  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Verify your details</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          We sent a verification email to <b>{userData.email}</b>
        </p>
        <div className='mt-6'>
          <span className='text-sm text-grey-300'>Not seeing the email?</span>
          <span
            className='text-sm text-blue-900 font-medium hover:cursor-pointer'
            onClick={() => handleSubmit()}>
            {' '}
            Resend
          </span>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default AccountCreationPage3;
