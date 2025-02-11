import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CheckComponent from '@/components/Account/CheckComponent';

const userRoles = [
  {
    title: 'Individual',
    subText:
      'Empower yourself with real-time Air Pollution Location Data for research and personal use. Stay informed, stay healthy. Join the clean air revolution today.',
    disabled: false,
  },
  {
    title: 'Organisation',
    subText:
      'Book a demo session to see how AirQo Analytics can empower your organization with actionable insights and streamlined management.',
    disabled: false,
  },
];

const UserDesignation = () => {
  const [clickedRole, setClickedRole] = useState('');
  const router = useRouter();

  const routeToCreation = () => {
    if (clickedRole) {
      router.push(
        `/account/creation/${clickedRole.toLowerCase()}/demo-creation`,
      );
    }
  };

  const handleRoleClick = (roleTitle, disabled) => {
    if (disabled) return;
    setClickedRole((prevRole) => (prevRole === roleTitle ? '' : roleTitle));
  };

  const getButtonText = () => {
    return clickedRole === 'Organisation' ? 'Get Started' : 'Continue';
  };

  return (
    <div className="relative w-screen min-h-screen bg-white overflow-x-hidden">
      <div className="absolute left-0 right-0 top-0 bottom-0 mt-14 sm:mt-20 lg:mt-44 mx-auto w-11/12 lg:w-7/12 flex flex-col items-center">
        <h2 className="text-3xl text-black-700 font-semibold text-center">
          How would you like to get started?
        </h2>
        <p className="text-xl text-black-700 font-normal mt-3 text-center">
          Select an option to tailor your experience.
        </p>

        <div className="mt-10 w-full flex flex-col lg:flex-row lg:justify-center lg:space-x-6 space-y-6 lg:space-y-0">
          {userRoles.map(({ title, subText, disabled }, index) => (
            <div
              key={index}
              className="flex-1 cursor-pointer"
              onClick={() => handleRoleClick(title, disabled)}
              onKeyUp={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleRoleClick(title, disabled);
                }
              }}
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
            >
              {/* 
                Responsive height classes ensure uniformity across screen sizes:
                h-48 on small screens, h-56 on sm, h-64 on md, and h-72 on lg.
              */}
              <CheckComponent
                text={title}
                subText={subText}
                checked={clickedRole === title}
                disabled={disabled}
                width="w-full"
                className="flex flex-col justify-center p-6 border rounded-lg shadow-sm hover:shadow-md transition h-48 sm:h-56 md:h-64 lg:h-72"
              />
            </div>
          ))}
        </div>

        {clickedRole && (
          <button
            onClick={routeToCreation}
            className="mt-8 w-[262px] flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-[12px] hover:bg-blue-700 transition"
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserDesignation;
