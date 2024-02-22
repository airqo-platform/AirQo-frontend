import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LocationIcon from '@/icons/LocationIcon';
import MenuIcon from '@/icons/map/menuIcon';
import AirQoMap from '@/components/Map/AirQoMap';
import { useDispatch, useSelector } from 'react-redux';
import HomeIcon from '@/icons/map/homeIcon';
import { useRouter } from 'next/router';
import { AirQualityLegend } from '@/components/Map/components/Legend';
import allCountries from '@/components/Map/components/countries';
import SearchField from '@/components/search/SearchField';
import { getSitesSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';

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
      </div>
    </div>
  );
};

const CountryList = ({ data, selectedCountry, setSelectedCountry }) => {
  const dispatch = useDispatch();

  const sortedData = [...data].sort((a, b) => a.country.localeCompare(b.country));

  return (
    <div className='flex space-x-4 overflow-x-auto py-4 ml-4 map-scrollbar'>
      {sortedData.map((country, index) => (
        <div
          key={index}
          className={`flex items-center cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 p-2  min-w-max space-x-2 m-0 ${
            selectedCountry?.country === country.country ? 'border-2 border-blue-400' : ''
          }`}
          onClick={() => {
            setSelectedCountry(country);
            dispatch(
              setLocation({
                country: country.country,
              }),
            );
          }}>
          <img src={country.flag} alt={country.country} width={20} height={20} />
          <span>{country.country}</span>
        </div>
      ))}
    </div>
  );
};

const index = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [location, setLocation] = useState();
  const [showSideBar, setShowSideBar] = useState(true);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedSite, setSelectedSite] = useState(null);
  const siteData = useSelector((state) => state.grids.sitesSummary);
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  // admin check
  const isAdmin = false;

  // Use destructuring to directly access individual_preferences
  const { individual_preferences } = useSelector((state) => state.defaults);

  // Use flatMap for more efficient mapping and flattening
  const selectedSites = individual_preferences.flatMap((pref) => pref.selected_sites);

  // siteDetails
  const siteDetails = siteData.sites;

  useEffect(() => {
    dispatch(getSitesSummary());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (
        (window.innerWidth < 768 || (window.innerWidth >= 600 && window.innerWidth <= 800)) &&
        router.pathname === '/map'
      ) {
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

  const handleHomeClick = () => {
    router.push('/Home');
  };

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleLocationSelect = () => {
    setLocation();
  };

  const handleSearch = (results) => {
    setSearchResults(results);
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

  // Assuming siteDetails and allCountries are defined
  let uniqueCountries = [];
  let result = [];

  siteDetails.forEach((site) => {
    if (!uniqueCountries.includes(site.country)) {
      uniqueCountries.push(site.country);
      let countryDetails = allCountries.find((data) => data.country === site.country);
      if (countryDetails) {
        result.push({ ...site, ...countryDetails });
      } else {
        return;
      }
    }
  });

  return (
    <Layout noTopNav={false}>
      <div className='relative'>
        <>
          {showSideBar && (
            <div className='absolute left-0 top-0 w-[280px] h-full md:w-[400px] bg-white shadow-lg shadow-right space-y-4 z-50 overflow-y-auto'>
              <div className={!isFocused ? 'space-y-4' : 'hidden'}>
                <div className='px-4 pt-4'>
                  <div className='w-full flex justify-start items-center'>
                    <label className='font-medium text-xl'>Map</label>
                  </div>
                  <p className='text-gray-500 text-sm font-normal w-auto md:w-[316.681px;] mt-6'>
                    Navigate, Explore, and Understand Air Quality Data with Precision, Right Down to
                    Your Neighborhood
                  </p>
                  {isAdmin && (
                    <TabSelector selectedTab={selectedTab} setSelectedTab={handleSelectedTab} />
                  )}
                </div>
                {isAdmin && <hr />}
              </div>
              {selectedTab === 'locations' &&
                (!isFocused ? (
                  <div className='px-4 space-y-4'>
                    <div onMouseDown={() => setIsFocused(true)}>
                      <SearchField />
                    </div>
                    <div className='flex justify-between items-center'>
                      <button
                        onClick={() => {
                          dispatch(setCenter({ latitude: 16.1532, longitude: 13.1691 }));
                          dispatch(setZoom(1.5));
                          setShowSideBar(false);
                          setSelectedSite(null);
                        }}
                        className='px-4 py-2 rounded-full bg-blue-500 text-white'>
                        All
                      </button>
                      <CountryList
                        data={result}
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                      />
                    </div>
                    <div className='space-y-2 max-h-[445px] overflow-y-scroll map-scrollbar'>
                      <label className='font-medium text-gray-600 text-sm'>Suggestions</label>
                      <hr />
                      {selectedSites.map((sites) => (
                        <div
                          key={sites._id}
                          className={`flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer hover:bg-grey-100 p-2 rounded-lg ${
                            sites._id === selectedSite?._id ? 'bg-blue-100' : ''
                          }`}
                          onClick={() => {
                            handleLocationSelect(sites);
                          }}>
                          <div className='p-2 rounded-full bg-gray-100'>
                            <LocationIcon />
                          </div>
                          <div className='ml-3 flex flex-col item-start border-b w-full relative'>
                            <span className='font-normal text-black capitalize text-lg overflow-ellipsis overflow-hidden w-full'>
                              {sites.name}
                            </span>
                            <span className='font-normal text-gray-500 capitalize text-sm mb-2'>
                              {sites.region + ',' + sites.country}
                            </span>
                          </div>
                        </div>
                      ))}
                      <hr />
                    </div>
                  </div>
                ) : (
                  // Search focused view
                  <div className='px-4 pt-4'>
                    <div className='w-full flex justify-start items-center'>
                      <button
                        onClick={() => setIsFocused(false)}
                        className='font-medium text-xl focus:outline-none mb-2'>
                        Back
                      </button>
                    </div>
                    <SearchField
                      data={siteDetails}
                      onSearch={handleSearch}
                      searchKeys={['city', 'village', 'country']}
                    />
                    {searchResults.length > 0 ? (
                      <div className='space-y-2 max-h-[445px] overflow-y-scroll mt-4'>
                        <label className='font-medium text-gray-600 text-sm'>Results</label>
                        <hr />
                        {searchResults.map((grid) => (
                          <div
                            key={grid._id}
                            className='flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer hover:bg-blue-100 p-2 rounded-lg'
                            onClick={() => {
                              handleLocationSelect(grid);
                            }}>
                            <div className='p-2 rounded-full bg-gray-100'>
                              <LocationIcon />
                            </div>
                            <div className='ml-3 flex flex-col item-start border-b w-full'>
                              <span className='font-normal text-black capitalize text-lg'>
                                {grid.name}
                              </span>
                              <span className='font-normal text-gray-500 capitalize text-sm mb-2'>
                                {grid.region + ',' + grid.country}
                              </span>
                            </div>
                          </div>
                        ))}
                        <hr />
                      </div>
                    ) : (
                      <div className='flex justify-center items-center h-80'>
                        <p className='text-gray-500 text-sm font-normal'>No results found</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
          <div
            className={`absolute bottom-2 ${
              showSideBar ? 'left-[calc(280px+15px)] md:left-[calc(400px+15px)]' : 'left-[15px]'
            } z-50`}>
            <AirQualityLegend />
          </div>
          <div
            className={`absolute top-4 ${
              showSideBar ? 'left-[calc(280px+15px)] md:left-[calc(400px+15px)]' : 'left-[15px]'
            } z-50`}>
            <div className='flex flex-col space-y-4'>
              <button
                className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'
                onClick={() => setShowSideBar(!showSideBar)}>
                <MenuIcon />
              </button>
              <button
                className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'
                onClick={() => handleHomeClick()}>
                <HomeIcon />
              </button>
            </div>
          </div>
        </>
        <AirQoMap
          showSideBar={showSideBar}
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          customStyle='flex-grow h-screen w-full relative bg-[#e6e4e0]'
        />
      </div>
    </Layout>
  );
};

export default index;
