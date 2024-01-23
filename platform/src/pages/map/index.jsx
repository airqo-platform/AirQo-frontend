import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CloseIcon from '@/icons/close_icon';
import LocationIcon from '@/icons/LocationIcon';
import SearchIcon from '@/icons/Common/search_md.svg';
import AirQoMap from '@/components/Map/AirQoMap';

const TabSelector = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className='mt-6'>
      <div className='flex flex-row justify-center items-center bg-secondary-neutral-light-25 rounded-md border border-secondary-neutral-light-50 p-1'>
        <div
          onClick={() => setSelectedTab('locations')}
          className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
            selectedTab === 'locations' ? 'border rounded-md bg-white shadow-sm' : ''
          }`}>
          Locations
        </div>
        <div
          onClick={() => setSelectedTab('sites')}
          className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
            selectedTab === 'sites' ? 'border rounded-md bg-white shadow-sm' : ''
          }`}>
          Sites
        </div>
        <div
          onClick={() => setSelectedTab('airqlouds')}
          className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
            selectedTab === 'airqlouds' ? 'border rounded-md bg-white shadow-sm' : ''
          }`}>
          AirQlouds
        </div>
      </div>
    </div>
  );
};

const SearchField = () => {
  return (
    <div className='w-full flex flex-row items-center justify-start'>
      <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
        <SearchIcon />
      </div>
      <input
        placeholder='Search Villages, Cities or Country'
        className='input text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
      />
    </div>
  );
};

const index = () => {
  const [location, setLocation] = useState();
  const [showSideBar, setShowSideBar] = useState(true);
  const [selectedTab, setSelectedTab] = useState('locations');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSideBar(false);
      } else {
        setShowSideBar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleLocationSelect = () => {
    setLocation();
  };

  const locations = [
    {
      id: 1,
      name: 'Kampala',
      country: 'Central, Uganda',
    },
    {
      id: 2,
      name: 'Nairobi',
      country: 'Central, Kenya',
    },
    {
      id: 3,
      name: 'kiambu',
      country: 'Eastern, Kenya',
    },
    {
      id: 4,
      name: 'Kitgum',
      country: 'Northern, Uganda',
    },
    {
      id: 5,
      name: 'Kigaali',
      country: 'Central, Rwanda',
    },
  ];

  const countries = [
    {
      id: 1,
      name: 'Uganda',
      flag: null,
    },
    {
      id: 2,
      name: 'Kenya',
      flag: null,
    },
    {
      id: 3,
      name: 'Nigeria',
      flag: null,
    },
    {
      id: 4,
      name: 'Rwanda',
      flag: null,
    },
    {
      id: 5,
      name: 'Tanzania',
      flag: null,
    },
  ];

  return (
    <Layout pageTitle='AirQo Map' noTopNav={false}>
      <div className='relative flex w-full h-full'>
        {showSideBar && (
          <div className='w-[280px] h-full md:w-[400px] bg-white shadow-lg shadow-right space-y-4 z-50'>
            <div className='px-4 pt-4'>
              <div className='w-full flex justify-between items-center'>
                <div>
                  <label className='font-medium text-xl'>Map</label>
                </div>
                <button
                  className='p-2 border rounded-xl hover:bg-gray-100'
                  onClick={() => setShowSideBar(!showSideBar)}>
                  <CloseIcon width={15} height={15} fill={'#6F87A1'} />
                </button>
              </div>
              <p className='text-gray-500 text-sm font-normal w-auto md:w-[316.681px;] mt-6'>
                Navigate, Explore, and Understand Air Quality Data with Precision, Right Down to
                Your Neighborhood
              </p>
              <TabSelector selectedTab={selectedTab} setSelectedTab={handleSelectedTab} />
            </div>
            <hr />
            <div className='px-4 space-y-4'>
              <SearchField />

              <div className='flex justify-between items-center'>
                <button className='px-4 py-2 rounded-full bg-blue-500 text-white'>All</button>
                <div className='flex space-x-4 overflow-x-auto custom-scrollbar py-4 ml-4'>
                  {countries.map((country) => (
                    <div
                      key={country.id}
                      className='flex items-center rounded-full bg-gray-100 p-2 space-x-2'>
                      {/* flags */}
                      <span>{country.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='space-y-2'>
                <label className='font-medium text-gray-600 text-sm'>Suggestions</label>
                <hr />
                <div className='overflow-y-auto'>
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className='flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer hover:bg-blue-100 p-2 rounded-lg'
                      onClick={() => {
                        handleLocationSelect();
                      }}>
                      <div className='p-2 rounded-full bg-gray-100'>
                        <LocationIcon />
                      </div>
                      <div className='ml-3 flex flex-col item-start border-b w-full'>
                        <span className='font-normal text-black capitalize text-lg'>
                          {location.name}
                        </span>
                        <span className='font-normal text-gray-500 capitalize text-sm mb-2'>
                          {location.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <hr />
              </div>
            </div>
          </div>
        )}
        <div className='relative h-auto w-screen'>
          {!showSideBar && (
            <button
              className='absolute top-4 left-4 z-50 text-red-400'
              onClick={() => setShowSideBar(!showSideBar)}>
              open
            </button>
          )}
          <AirQoMap
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            style='flex-grow w-[100%] h-screen relative'
          />
        </div>
      </div>
    </Layout>
  );
};

export default index;
