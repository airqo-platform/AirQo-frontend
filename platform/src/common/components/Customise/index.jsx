import React, { useEffect, useState } from 'react';
import CloseIcon from '@/icons/Actions/close.svg';
import LocationsContentComponent from './LocationsContentComponent';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '@/components/Spinner';
import {
  updateUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import Toast from '@/components/Toast';

const CustomiseLocationsComponent = ({ toggleCustomise }) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('locations');
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });
  const selectedLocations = useSelector((state) => state.grids.selectedLocations) || [];
  const preferenceData = useSelector((state) => state.defaults.individual_preferences);
  const customisedLocations = preferenceData[0].selected_sites || [];
  const id = useSelector((state) => state.login.userInfo._id);

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setCreationErrors({
      state: false,
      message: '',
    });
    if (selectedLocations.length > 4) {
      setCreationErrors({
        state: true,
        message: 'Please star only 4 locations',
      });
    } else {
      const data = {
        user_id: id,
        selected_sites: selectedLocations,
      };
      try {
        const response = await dispatch(updateUserPreferences(data));
        if (!response.payload.success) {
          setCreationErrors({
            state: true,
            message: response.payload.message,
          });
          setLoading(false);
        } else {
          toggleCustomise();
        }
      } catch (error) {
        throw error;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    dispatch(getIndividualUserPreferences(id));
  }, [preferenceData]);

  return (
    <div>
      {creationErrors.state && (
        <Toast type={'error'} timeout={6000} message={creationErrors.message} />
      )}
      <div
        className='absolute right-0 top-0 w-full lg:w-4/12 h-full overflow-y-scroll bg-white z-50 border-l-grey-50 px-6'
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
        {selectedTab === 'locations' && (
          <LocationsContentComponent selectedLocations={customisedLocations} />
        )}
        {/* TODO: Pollutant component and post selection to user defaults */}
      </div>
      <div className='absolute w-full lg:w-4/12 bg-white z-50 bottom-0 right-0 border-t border-input-light-outline py-4 px-6'>
        <div className='flex flex-row justify-end items-center'>
          <button
            className='btn bg-white mr-3 border border-input-light-outline text-sm text-secondary-neutral-light-800 font-medium py-3 px-4 rounded-lg hover:bg-white hover:border-input-light-outline'
            onClick={() => toggleCustomise()}>
            Cancel
          </button>
          {selectedLocations.length === 4 ? (
            <button
              className='btn bg-blue-900 text-sm border-none text-white font-medium py-3 px-4 rounded-lg hover:bg-primary-600'
              onClick={() => handleSubmit()}>
              {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Apply'}
            </button>
          ) : (
            <button className='btn btn-disabled bg-white mr-3 border border-input-light-outline text-sm text-secondary-neutral-light-800 font-medium py-3 px-4 rounded-lg'>
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomiseLocationsComponent;
