import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CloseIcon from '@/icons/close_icon';
import LocationIcon from '@/icons/LocationIcon';
import SearchIcon from '@/icons/Common/search_md.svg';
import MenuIcon from '@/icons/map/menuIcon';
import AirQoMap from '@/components/Map/AirQoMap';
import { useRouter } from 'next/router';
import { AirQualityLegend } from '@/components/Map/components/Legend';
import allCountries from '@/components/Map/components/countries';

const countries = [
  {
    id: 1,
    name: 'Uganda',
    flag: 'UG',
  },
  {
    id: 2,
    name: 'Kenya',
    flag: 'KE',
  },
  {
    id: 3,
    name: 'Nigeria',
    flag: 'NG',
  },
  {
    id: 4,
    name: 'Rwanda',
    flag: 'RW',
  },
  {
    id: 5,
    name: 'Tanzania',
    flag: 'TZ',
  },
];

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

const filteredCountries = allCountries.filter((country) =>
  countries.find((c) => c.name === country.country),
);

const CountryList = ({ selectedCountry, setSelectedCountry }) => (
  <div className='flex space-x-4 overflow-x-auto py-4 ml-4'>
    {filteredCountries.map((country, index) => (
      <div
        key={index}
        className='flex items-center cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 p-2  min-w-max space-x-2 m-0'
        style={{
          backgroundColor: selectedCountry?.country === country.country ? '#77A9FF' : '',
        }}
        onClick={() => setSelectedCountry(country)}>
        <img src={country.flag} alt={country.country} width={20} height={20} />
        <span>{country.country}</span>
      </div>
    ))}
  </div>
);

const index = () => {
  const router = useRouter();
  const [location, setLocation] = useState();
  const [showSideBar, setShowSideBar] = useState(true);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && router.pathname === '/map') {
        setShowSideBar(false);
      } else {
        localStorage.setItem('collapsed', true);
        setShowSideBar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [router.pathname]);

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

  return (
    <Layout pageTitle='AirQo Map' noTopNav={false}>
      <div className='relative'>
        <div>
          {showSideBar && (
            <div className='absolute left-0 top-0 w-[280px] h-screen md:w-[400px] bg-white shadow-lg shadow-right space-y-4 z-50'>
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
                  <CountryList
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                  />
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
          <div
            className={`absolute bottom-4 ${
              showSideBar ? 'left-[calc(280px+15px)] md:left-[calc(400px+15px)]' : 'left-[15px]'
            } z-50`}>
            <AirQualityLegend />
          </div>
        </div>
        <div className='h-auto w-full relative'>
          {!showSideBar && (
            <button
              className='absolute top-4 left-3 z-50 inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'
              onClick={() => setShowSideBar(!showSideBar)}>
              <MenuIcon />
            </button>
          )}
          <AirQoMap
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            customStyle='flex-grow h-screen w-full relative'
          />
        </div>
      </div>
    </Layout>
  );
};

export default index;
