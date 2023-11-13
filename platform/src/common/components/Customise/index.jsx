import React, { useState } from 'react';
import CloseIcon from '@/icons/Actions/close.svg';
import LocationsContentComponent from './LocationsContentComponent';

const CustomiseLocationsComponent = ({ toggleCustomise }) => {
  const [selectedTab, setSelectedTab] = useState('locations');

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div>
      <div
        className='absolute right-0 top-0 w-full lg:w-3/12 h-full overflow-y-scroll bg-white z-20 border-l-grey-50 px-6'
        style={{ boxShadow: '0px 16px 32px 0px rgba(83, 106, 135, 0.20)' }}>
        <div className='flex flex-row justify-between items-center mt-6'>
          <h3 className='text-xl text-black-800 font-semibold'>Customise</h3>
          <div
            className='p-3 rounded-md border border-secondary-neutral-light-100 bg-white hover:cursor-pointer'
            onClick={() => toggleCustomise()}>
            <CloseIcon />
          </div>
        </div>
        <div className='mt-6'>
          <p className='text-grey-350 text-sm font-normal'>
            Select at least 4 locations you would like to feature on your overview page.
          </p>
        </div>
        <div className='mt-6'>
          <div className='flex flex-row justify-center items-center bg-secondary-neutral-light-25 rounded-md border border-secondary-neutral-light-50 p-1'>
            <div
              onClick={() => handleSelectedTab('locations')}
              className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
                selectedTab === 'locations' ? 'border rounded-md bg-white shadow-sm' : ''
              }`}>
              Locations
            </div>
            <div
              onClick={() => handleSelectedTab('pollutants')}
              className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
                selectedTab === 'pollutants' ? 'border rounded-md bg-white shadow-sm' : ''
              }`}>
              Pollutants
            </div>
          </div>
        </div>
        {selectedTab === 'locations' && <LocationsContentComponent />}
        {/* TODO: Pollutant component and post selection to user defaults */}
      </div>
      <div className='absolute w-full lg:w-3/12 bg-white z-30 bottom-0 right-0 border-t border-input-light-outline py-4 px-6'>
        <div className='flex flex-row justify-end items-center'>
          <button className='mr-3 border border-input-light-outline text-sm text-secondary-neutral-light-800 font-medium py-3 px-4 rounded-lg'>
            Cancel
          </button>
          {/* TODO: Update user preferences onclick */}
          <button className='bg-primary-600 text-sm text-white font-medium py-3 px-4 rounded-lg'>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomiseLocationsComponent;
