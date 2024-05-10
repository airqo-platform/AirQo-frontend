import React, { useEffect, useState } from 'react';
import CloseIcon from '@/icons/Actions/close.svg';
import LocationsContentComponent from './LocationsContentComponent';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '@/components/Spinner';
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import Toast from '@/components/Toast';
import { RxInfoCircled } from 'react-icons/rx';
import { completeTask } from '@/lib/store/services/checklists/CheckList';

const tabs = ['Locations', 'Pollutants'];

const CustomiseLocationsComponent = ({ toggleCustomise }) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });
  const [resetSearchData, setResetSearchData] = useState(false);

  /**
   * @description Fetches the selected locations, user preferences and chart data from the redux store
   * @returns {Array} selectedLocations, preferenceData, customisedLocations, userId, chartData
   */
  const selectedLocations = useSelector((state) => state.grids.selectedLocations) || [];
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];
  const customisedLocations =
    preferenceData.length > 0 ? preferenceData[0].selected_sites.slice(0, 4) : [];
  const userId = useSelector((state) => state.login.userInfo._id);
  const chartData = useSelector((state) => state.chart);

  /**
   * @description Handles the submission of the customised locations
   * @returns {void}
   */
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
      setLoading(false);
      return;
    }
    const data = {
      user_id: userId,
      selected_sites: selectedLocations,
      startDate: chartData.chartDataRange.startDate,
      endDate: chartData.chartDataRange.endDate,
      chartType: chartData.chartType,
      pollutant: chartData.pollutionType,
      frequency: chartData.timeFrame,
      period: {
        label: chartData.chartDataRange.label,
      },
    };
    try {
      const response = await dispatch(replaceUserPreferences(data));
      if (response.payload && response.payload.success) {
        dispatch(getIndividualUserPreferences(userId));
        toggleCustomise();
        dispatch(completeTask(2));
      } else {
        throw new Error('Error updating user preferences');
      }
    } catch (error) {
      setCreationErrors({
        state: true,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {creationErrors.state && (
        <Toast type={'error'} timeout={6000} message={creationErrors.message} />
      )}
      <div
        className='absolute right-0 top-0 w-full md:w-96
         h-full overflow-y-scroll bg-white z-50 border-l-grey-50 px-6'
        style={{ boxShadow: '0px 16px 32px 0px rgba(83, 106, 135, 0.20)' }}
      >
        <div onClick={() => setResetSearchData(true)}>
          <div className='flex flex-row justify-between items-center mt-6'>
            <h3 className='flex items-center text-xl text-black-800 font-semibold'>
              Customise
              <span
                className='tooltip tooltip-bottom ml-1 hover:cursor-pointer text-lg font-normal'
                data-tip='Changes are applied when 4 locations have been selected'
              >
                <RxInfoCircled style={{ paddingTop: '2px' }} />
              </span>
            </h3>
            <div
              className='p-3 rounded-md border border-secondary-neutral-light-100 bg-white hover:cursor-pointer'
              onClick={() => toggleCustomise()}
            >
              <CloseIcon />
            </div>
          </div>
          <div className='mt-6'>
            <p className='text-grey-350 text-sm font-normal'>
              Select any 4 locations you would like to feature on your overview page.
            </p>
          </div>
        </div>
        {false && (
          <div className='mt-6'>
            {/* Tab section */}
            <div className='flex flex-row justify-center items-center bg-secondary-neutral-light-25 rounded-md border border-secondary-neutral-light-50 p-1'>
              {tabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
                    selectedTab === tab ? 'border rounded-md bg-white shadow-sm' : ''
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedTab === tabs[0] && (
          <LocationsContentComponent
            selectedLocations={customisedLocations}
            resetSearchData={resetSearchData}
          />
        )}
        {/* TODO: Pollutant component and post selection to user defaults */}
      </div>
      <div className='absolute w-full md:w-96 bg-white z-50 bottom-0 right-0 border-t border-input-light-outline py-4 px-6'>
        <div className='flex flex-row justify-end items-center'>
          <button
            className='btn bg-white mr-3 border border-input-light-outline text-sm text-secondary-neutral-light-800 font-medium py-3 px-4 rounded-lg hover:bg-white hover:border-input-light-outline'
            onClick={() => toggleCustomise()}
          >
            Cancel
          </button>
          {selectedLocations.length === 4 ? (
            <button
              className='btn bg-blue-900 text-sm border-none text-white font-medium py-3 px-4 rounded-lg hover:bg-primary-600'
              onClick={() => handleSubmit()}
            >
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
