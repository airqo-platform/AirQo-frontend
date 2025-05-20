import React, { useState } from 'react';
import { useRouter } from 'next/router';
import GoogleLogo from '@/icons/Common/google_logo.svg';
import { getGoogleAuthDetails } from '@/core/apis/Account';
import CheckComponent from '@/components/Account/CheckComponent';

const userRoles = [
  {
    title: 'Individual',
    subText:
      'Empower yourself with real-time Air Pollution Location Data for research and personal use. Stay informed, stay healthy. Join the clean air revolution today.',
    disabled: false,
    // Internal route for individuals.
    route: (router) => router.push(`/account/creation/individual/register`),
  },
  {
    title: 'Organisation',
    subText:
      'Beyond data, gain access to network management tools. Drive meaningful change, one location at a time. Shape a cleaner future for all.',
    disabled: false,
    route: (router) =>
      router.push(`/account/creation/organisation/request-access`),
  },
];

const UserDesignation = () => {
  const [clickedRole, setClickedRole] = useState('');
  const router = useRouter();

  const handleRoleClick = (roleTitle, disabled) => {
    if (disabled) return;
    setClickedRole((prevRole) => (prevRole === roleTitle ? '' : roleTitle));
  };

  const routeToCreation = () => {
    if (!clickedRole) return;
    const selectedRole = userRoles.find((role) => role.title === clickedRole);
    if (selectedRole && selectedRole.route) {
      selectedRole.route(router);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-white dark:bg-transparent overflow-x-hidden">
      <div className="absolute left-0 right-0 top-0 bottom-0 mt-14 sm:mt-20 lg:mt-44 mx-auto w-11/12 lg:w-7/12 flex flex-col items-center">
        <h2 className="text-3xl text-black-700 dark:text-white font-semibold text-center">
          How are you planning to use AirQo Analytics?
        </h2>
        <p className="text-xl text-black-700 dark:text-white font-normal mt-3 text-center">
          We&apos;ll streamline your setup experience accordingly
        </p>
        <div className="mt-10 flex justify-center items-center">
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:ml-20">
            {userRoles.map((role, index) => (
              <div
                key={index}
                className="w-full cursor-pointer mb-8 lg:w-10/12 lg:mb-0 flex flex-col"
                role="button"
                tabIndex={0}
                onClick={() => handleRoleClick(role.title, role.disabled)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleRoleClick(role.title, role.disabled);
                  }
                }}
              >
                <CheckComponent
                  text={role.title}
                  width="w-full lg:w-10/12"
                  subText={role.subText}
                  checked={clickedRole === role.title}
                  disabled={role.disabled}
                />
              </div>
            ))}
          </div>
        </div>
        {clickedRole && (
          <button
            onClick={routeToCreation}
            className="mt-6 w-[262px] flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-[12px]"
          >
            {clickedRole === 'Organisation' ? 'Get started' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
};

const GoogleAccountCreation = () => (
  <div className="w-full mt-6">
    <div className="grid grid-cols-3 items-center justify-center">
      <span className="w-full border border-grey-200"></span>
      <span className="justify-self-center w-fit">Or</span>
      <span className="w-full border border-grey-200"></span>
    </div>
    <div className="mt-6">
      <button
        className="btn bg-form-input rounded-none w-full outline-none border-none flex flex-row items-center justify-center hover:bg-grey-200"
        onClick={getGoogleAuthDetails}
      >
        <span style={{ color: '#000000', fontWeight: '400', opacity: '0.5' }}>
          Sign up with
        </span>
        <span className="pl-2">
          <GoogleLogo />
        </span>
      </button>
    </div>
  </div>
);

export default UserDesignation;
