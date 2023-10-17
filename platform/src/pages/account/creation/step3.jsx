import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/lib/store/services/account/CreationSlice';
import Toast from '@/components/Toast';

const AccountCreationPage3 = () => {
  const userData = useSelector((state) => state.creation.userData);
  const errors = useSelector((state) => state.creation.errors);
  const success = useSelector((state) => state.creation.success);
  const [verificationErrors, setVerificationErrors] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setVerificationErrors(false);
    try {
      const res = await dispatch(createUser(userData));
      if (!success) {
        setVerificationErrors(true);
      }
      return res;
    } catch (err) {
      return err;
    }
  };

  return (
    <AccountPageLayout>
      {verificationErrors && (
        <Toast
          type={'error'}
          timeout={5000}
          message={`${
            errors.email || errors.message || errors.password || errors.firstName || errors.lastName
          }`}
        />
      )}
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
