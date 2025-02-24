'use client';
import React from 'react';

import mainConfig from '@/configs/mainConfigs';

import { CustomButton } from '../ui';

const ActionButtons2 = () => {
  return (
    <div
      className={`flex flex-col md:flex-row gap-6 w-full ${mainConfig.containerClass}`}
    >
      {/* Card 1 */}
      <CustomButton
        onClick={() => {
          window.open(
            'https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform',
          );
        }}
        className="bg-transparent p-0 m-0"
      >
        <div className="flex flex-col justify-between bg-blue-600 items-start text-start text-white md:rounded-xl p-8 w-full cursor-pointer transform transition-transform duration-300 focus:outline-none">
          <div>
            <h3 className="text-2xl font-medium mb-4">
              Increase the visibility of your work in African Cities. Access a
              pool of experts.
            </h3>
          </div>
          <p className="mt-4 text-lg hover:underline">Join the Network →</p>
        </div>
      </CustomButton>

      {/* Card 2 */}
      <CustomButton
        onClick={() => {
          window.open(
            'https://docs.google.com/forms/d/14jKDs2uCtMy2a_hzyCiJnu9i0GbxITX_DJxVB4GGP5c/edit',
          );
        }}
        className="bg-transparent p-0 m-0"
      >
        <div className="flex flex-col justify-between items-start text-start bg-blue-50 text-blue-600 md:rounded-xl p-8 w-full cursor-pointer transform transition-transform duration-300 focus:outline-none">
          <div>
            <h3 className="text-2xl font-medium mb-4">
              Are you organising an event/activity and you would want it
              featured?
            </h3>
          </div>
          <p className="mt-4 text-lg hover:underline">Register Here →</p>
        </div>
      </CustomButton>
    </div>
  );
};

export default ActionButtons2;
