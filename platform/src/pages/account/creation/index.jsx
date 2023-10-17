import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setUserEmail } from '@/lib/store/services/account/CreationSlice';
import { useRouter } from 'next/router';
import GoogleLogo from '@/icons/Common/google_logo.svg';
import { getGoogleAuthDetails } from '@/core/apis/Account';
import RadioComponent from '@/components/Account/RadioComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';

const userRoles = [
  {
    title: 'Individual',
    subText:
      'Empower yourself with real-time Air Pollution Location Data for research and personal use. Stay informed, stay healthy. Join the clean air revolution today.',
  },
  {
    title: 'Organisation',
    subText:
      'Beyond data, gain access to network management tools. Drive meaningful change, one location at a time. Shape a cleaner future for all',
  },
];

const UserDesignation = () => {
  const [clickedRole, setClickedRole] = useState('');
  const router = useRouter();

  const routeToIndividualCreation = () => {
    router.push('/account/creation/step2');
  };
  return (
    <AccountPageLayout childrenHeight={'lg:h-[580]'}>
      {clickedRole === '' && (
        <div className='w-full'>
          <h2 className='text-3xl text-black-700 font-medium'>
            How are you planning to use AirQo Analytics?
          </h2>
          <p className='text-xl text-black-700 font-normal mt-3'>
            We'll streamline your setup experience accordingly
          </p>
          <div className='mt-10'>
            <div className='w-full grid grid-cols-1 gap-y-8'>
              {userRoles.map((role, index) => (
                <div
                  key={index}
                  className='w-full'
                  onClick={() => {
                    setTimeout(() => {
                      setClickedRole(role.title);
                    }, 1200);
                  }}>
                  <RadioComponent text={role.title} width={'w-full'} subText={role.subText} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {clickedRole === 'Individual' && routeToIndividualCreation()}
    </AccountPageLayout>
  );
};

const GoogleAccountCreation = () => {
  return (
    <div className='w-full'>
      <div className='mt-6 grid grid-cols-3 items-center justify-center'>
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
      </div>
    </div>
  );
};

export default UserDesignation;
