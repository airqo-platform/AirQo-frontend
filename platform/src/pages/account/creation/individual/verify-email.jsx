import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/lib/store/services/account/CreationSlice';
import Toast from '@/components/Toast';
import SideImage from '@/images/Account/OrganisationSideQuote.png';

const IndividualAccountVerification = () => {
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
    <AccountPageLayout rightImage={SideImage}>
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
        <h2 className='text-3xl text-black-700 font-semibold lg:w-10/12 md:mt-20 lg:mt-2'>
          Please confirm your email address
        </h2>
        <p className='text-xl text-grey-350 font-normal mt-6 lg:w-10/12'>
          An email with confirmation instructions was sent to
        </p>
        <div className='mt-6'>
          <div className='w-full'>
            <input
              type='email'
              placeholder={`${userData.email}`}
              className='input border border-input-light-outline h-16 w-full text-lg'
              style={{ backgroundColor: '#F9FAFB', fontWeight: '500' }}
              disabled
            />
          </div>
        </div>
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

export default IndividualAccountVerification;
