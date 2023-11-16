import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedLocations,
  getSitesSummary,
} from '@/lib/store/services/deviceRegistry/GridsSlice';
import SearchIcon from '@/icons/Common/search_md.svg';
import LocationIcon from '@/icons/SideBar/Sites.svg';
import TrashIcon from '@/icons/Actions/bin_icon.svg';
import StarIcon from '@/icons/Actions/star_icon.svg';
import StarIconLight from '@/icons/Actions/star_icon_light.svg';
import DragIcon from '@/icons/Actions/drag_icon.svg';
import DragIconLight from '@/icons/Actions/drag_icon_light.svg';
import Toast from '../Toast';

const LocationsContentComponent = ({ selectedLocations }) => {
  const dispatch = useDispatch();
  const gridLocationsData = useSelector((state) => state.grids.sitesSummary.sites);

  const [location, setLocation] = useState('');
  const [inputSelect, setInputSelect] = useState(false);
  const [locationArray, setLocationArray] = useState(selectedLocations);
  const [filteredLocations, setFilteredLocations] = useState(gridLocationsData);
  const [unSelectedLocations, setUnSelectedLocations] = useState([]);

  const handleLocationEntry = (e) => {
    setInputSelect(false);
    filterBySearch(e);
    setLocation(e.target.value);
  };

  const toggleInputSelect = () => {
    setFilteredLocations(unSelectedLocations);
    inputSelect ? setInputSelect(false) : setInputSelect(true);
  };

  const filterBySearch = (e) => {
    const query = e.target.value;
    let locationList = [...gridLocationsData];
    locationList = locationList.filter((location) => {
      return location.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    setFilteredLocations(locationList);
  };

  const handleLocationSelect = (item) => {
    unSelectedLocations.includes(item)
      ? setUnSelectedLocations(unSelectedLocations.filter((location) => location._id !== item._id))
      : null;
    locationArray.includes(item)
      ? setLocationArray(locationArray.filter((location) => location._id !== item._id))
      : setLocationArray((locations) => [...locations, item]);
    setInputSelect(true);
    setLocation('');
  };

  const removeLocation = (item) => {
    setLocationArray(locationArray.filter((location) => location._id !== item._id));
    setUnSelectedLocations((locations) => [...locations, item]);
    dispatch(setSelectedLocations(locationArray));
  };

  useEffect(() => {
    dispatch(getSitesSummary());
    dispatch(setSelectedLocations(locationArray));
    while (unSelectedLocations.length < 15) {
      const randomIndex = Math.floor(Math.random() * gridLocationsData.length);
      const randomObject = gridLocationsData[randomIndex];
      if (!unSelectedLocations.includes(randomObject)) {
        unSelectedLocations.push(randomObject);
      }
    }
  }, [locationArray]);

  return (
    <form>
      {locationArray.length > 4 && (
        <Toast type={'error'} message='Choose only 4 locations' timeout={6000} />
      )}
      <div className='mt-6'>
        <div className='w-full flex flex-row items-center justify-start'>
          <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
            <SearchIcon />
          </div>
          <input
            onChange={(e) => {
              handleLocationEntry(e);
            }}
            onClick={() => toggleInputSelect()}
            value={location}
            placeholder='Search Villages, Cities or Country'
            className='input text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
          />
        </div>
        {location !== '' && (
          <div
            className={`bg-white max-h-48 overflow-y-scroll px-3 pt-2 pr-1 my-1 border border-input-light-outline rounded-md ${
              inputSelect ? 'hidden' : 'relative'
            }`}>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  className='flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer'
                  onClick={() => {
                    handleLocationSelect(location);
                  }}
                  key={location._id}>
                  <LocationIcon />
                  <div className='text-sm ml-1 text-black capitalize'>{location.name}</div>
                </div>
              ))
            ) : (
              <div className='flex flex-row justify-start items-center mb-0.5 text-sm w-full'>
                <LocationIcon />
                <div className='text-sm ml-1 text-black font-medium capitalize'>
                  Location not found
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {
        <div className='mt-4'>
          {locationArray.length > 0 ? (
            locationArray.map((location) => (
              <div
                className='border rounded-lg bg-secondary-neutral-light-25 border-input-light-outline flex flex-row justify-between items-center p-3 w-full mb-2'
                key={location._id}>
                <div className='flex flex-row items-center overflow-x-clip'>
                  <div>
                    <DragIcon />
                  </div>
                  <span className='text-sm text-secondary-neutral-light-800 font-medium'>
                    {location.name}
                  </span>
                </div>
                <div className='flex flex-row'>
                  <div
                    className='mr-1 hover:cursor-pointer'
                    onClick={() => removeLocation(location)}>
                    <TrashIcon />
                  </div>
                  <div className='bg-primary-600 rounded-md p-2 flex items-center justify-center'>
                    <StarIcon />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span/>
          )}
        </div>
      }
      <div className='mt-6'>
        <h3 className='text-sm text-black-800 font-semibold'>Suggestions</h3>
        <div className='mt-3'>
          {unSelectedLocations.length > 0 &&
            unSelectedLocations.slice(0, 15).map((location) => (
              <div
                className='border rounded-lg bg-secondary-neutral-light-25 border-input-light-outline flex flex-row justify-between items-center p-3 w-full mb-2'
                key={location._id}>
                <div className='flex flex-row items-center overflow-x-clip'>
                  <div>
                    <DragIconLight />
                  </div>
                  <span className='text-sm text-secondary-neutral-light-800 font-medium'>
                    {location.name}
                  </span>
                </div>
                <div className='flex flex-row'>
                  <div
                    className='border border-input-light-outline rounded-md p-2 flex items-center justify-center hover:cursor-pointer'
                    onClick={() => {
                      handleLocationSelect(location);
                    }}>
                    <StarIconLight />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </form>
  );
};

export default LocationsContentComponent;
