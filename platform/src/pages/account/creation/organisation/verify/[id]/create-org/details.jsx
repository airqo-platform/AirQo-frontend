import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import ProgressComponent from '@/components/Account/ProgressComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '@/icons/Actions/search.svg';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import {
  setOrgDetails,
  setOrgUpdateDetails,
  postOrganisationCreationDetails,
  updateOrganisationDetails,
} from '@/lib/store/services/account/CreationSlice';
import Toast from '@/components/Toast';
import Link from 'next/link';
import LocationIcon from '@/icons/SideBar/Sites.svg';
import CloseIcon from '@/icons/Actions/close.svg';
import {
  setSelectedLocations,
  getAllGridLocations,
} from '@/lib/store/services/deviceRegistry/GridsSlice';

const CreateOrganisationDetailsPageOne = ({ handleComponentSwitch }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const orgData = {
      grp_title: orgName,
      grp_description: orgDescription,
      grp_website: `https://${orgWebsite}`,
      user_id: id,
    };
    dispatch(setOrgDetails(orgData));
    setCreationErrors({
      state: false,
      message: '',
    });
    try {
      const response = await dispatch(postOrganisationCreationDetails(orgData));
      console.log('Response creation', response)
      if (!response.payload.data.success) {
        setCreationErrors({
          state: true,
          message: response.payload.data.message,
        });
      } else {
        handleComponentSwitch();
      }
    } catch (err) {
      return err;
    }
    setLoading(false);
  };

  return (
    <div className='lg:mb-3 md:mb-5'>
      <ProgressComponent colorFirst={true} />
      <div className='w-full'>
        <h2 className='text-3xl text-black font-semibold lg:w-10/12 md:mt-20 lg:mt-2'>
          Tell us about your organisation
        </h2>
        <form onSubmit={handleSubmit}>
          {creationErrors.state && (
            <Toast type={'error'} timeout={7000} message={creationErrors.message} />
          )}
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Organisation Name*</div>
              <div className='mt-2 w-full'>
                {orgName.length <= 2 ? (
                  <input
                    onChange={(e) => setOrgName(e.target.value)}
                    type='text'
                    placeholder='Enter a unique name'
                    className='input text-sm w-full h-12 rounded-lg bg-white border-input-light-outline focus:border-input-light-outline'
                    required
                  />
                ) : (
                  <input
                    onChange={(e) => setOrgName(e.target.value)}
                    type='text'
                    placeholder='Enter a unique name'
                    className='input text-sm w-full h-12 rounded-lg bg-white focus:border-input-outline border-input-outline'
                    required
                  />
                )}
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Website*</div>
              <div className='mt-2 w-full'>
                {orgWebsite.length >= 3 && !orgWebsite.includes('.') ? (
                  <>
                    <div className='flex flex-row'>
                      <span className='bg-white border border-input-light-outline w-auto h-12 p-3 text-sm rounded-l-lg text-grey-350 font-normal'>
                        https://
                      </span>
                      <input
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        type='text'
                        minLength={4}
                        className='w-full h-12 rounded-r-lg bg-white border-red-600 focus:border-red-600 text-sm'
                        required
                      />
                    </div>
                    <div className='flex flex-row items-start text-xs text-red-600 py-2'>
                      <HintIcon className='mr-2 stroke-grey-350' />
                      <span>Please provide a valid website! Ex: www.example.com</span>
                    </div>
                  </>
                ) : (
                  <div className='flex flex-row'>
                    <span className='bg-white border border-input-light-outline w-auto h-12 p-3 text-sm rounded-l-lg text-grey-350 font-normal'>
                      https://
                    </span>
                    <input
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      type='text'
                      minLength={4}
                      className={`text-sm w-full h-12 rounded-r-lg bg-white ${
                        orgWebsite.length <= 2
                          ? 'border-input-light-outline focus:border-input-light-outline'
                          : 'border-input-outline focus:border-input-outline'
                      }`}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Details about your Organisation*</div>
              <div className='mt-2 w-full flex flex-col justify-start'>
                <textarea
                  onChange={(e) => setOrgDescription(e.target.value)}
                  className='text-sm textarea textarea-lg border border-input-light-outline w-full focus:border-input-outline'
                  rows={4}
                  placeholder='Type a description'></textarea>
                <span className='text-xs text-grey-350 mt-2'>Write a short description</span>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            {orgName !== '' ? (
              <div className='w-full'>
                <button
                  type='submit'
                  onClick={handleSubmit}
                  className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                  {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Continue'}
                </button>
              </div>
            ) : (
              <div className='w-full'>
                <button
                  type='submit'
                  className='w-full btn btn-disabled bg-white rounded-none text-sm outline-none border-none'>
                  Continue
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateOrganisationDetailsPageTwo = ({ handleComponentSwitch }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgCountry, setOrgCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });
  const industryList = [
    'Textiles',
    'Transport',
    'Healthcare',
    'Manufacturing',
    'Agriculture',
    'Information Technology',
    'Policy & Government',
    'Education & Research',
    'Business',
    'Mining',
    'Hospitality',
    'Food and Catering',
    'Media & Journalism',
  ];
  const countryList = [
    'Uganda',
    'Kenya',
    'Mozambique',
    'Zimbabwe',
    'Tanzania',
    'Rwanda',
    'Burundi',
    'South Sudan',
    'Ghana',
    'Nigeria',
    'Botswana',
    'South Africa',
    'Ethiopia',
    'USA',
    'Europe',
    'Asia',
    'Australia',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreationErrors({
      state: false,
      message: '',
    });
    const orgData = {
      grp_industry: orgIndustry,
      grp_country: orgCountry,
    };
    dispatch(setOrgUpdateDetails(orgData));
    try {
      const response = await dispatch(updateOrganisationDetails(orgData, id));
      console.log('Response', response);
      if (!response.payload.data.success) {
        setCreationErrors({
          state: true,
          message: response.payload.data.message,
        });
      } else {
        handleComponentSwitch();
      } 
    } catch (error) {
      return error;
    }
    setLoading(false);
  };

  return (
    <div className='sm:ml-3 lg:ml-1'>
      <ProgressComponent colorFirst={true} colorSecond={true} />
      <div className='w-full'>
        <h2 className='text-3xl text-black font-semibold w-full lg:w-10/12 md:mt-20 lg:mt-2'>
          Tell us about your organization
        </h2>
        <form onSubmit={handleSubmit}>
          {creationErrors.state && (
            <Toast type={'error'} timeout={7000} message={creationErrors.message} />
          )}
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Industry</div>
              <div className='mt-2 w-full'>
                <select
                  className='w-full text-sm text-grey-350 font-normal select select-bordered outline-offset-0 border-input-light-outline focus-visible:border-input-outline'
                  onChange={(e) => setOrgCountry(e.target.value)}>
                  {industryList.map((country, key) => (
                    <option key={key} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Country</div>
              <div className='mt-2 w-full flex flex-row'>
                <select
                  className='w-full text-sm text-grey-350 font-normal select select-bordered outline-offset-0 border-input-light-outline focus-visible:border-input-outline'
                  onChange={(e) => setOrgIndustry(e.target.value)}>
                  {countryList.map((country, key) => (
                    <option key={key} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='mt-10'>
            <div className='sm:w-full lg:w-10/12 md:w-11/12'>
              <button
                type='submit'
                onClick={handleSubmit}
                className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Continue'}
              </button>
            </div>
          </div>
        </form>
        <div className='flex flex-row items-center justify-end mt-6'>
          <Link href='/analytics'>
            <span className='text-sm text-blue-900 font-medium hover:cursor-pointer hover:text-blue-950'>
              Complete this later
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const CreateOrganisationDetailsPageThree = () => {
  const dispatch = useDispatch();
  // const gridLocationsData = useSelector((state) => state.grids.gridsLocations) || [];
  const gridLocationsData = [
    {
      _id: '6527d02625739700178e1d8b',
      name: 'hellosss',
    },
    {
      _id: '60d058c8048305120d2d6165',
      name: 'Nansana west ward, Wakiso',
    },
    {
      _id: '60d058c8048305120d2d6160',
      name: 'Nansana east ward, Wakiso',
    },
    {
      _id: '60d058c8048305120d2d617e',
      name: 'Kawempe Industrial, Kawempe',
    },
    {
      _id: '61092bd2ea763ff8bb8e3894',
      name: 'Kawempe',
    },
    {
      _id: '60d058c8048305120d2d614f',
      name: 'Rubaga, Kampala',
    },
    {
      _id: '60d058c8048305120d2d6154',
      name: 'Kasubi, Rubaga',
    },
    {
      _id: '60d058c8048305120d2d6157',
      name: 'Seguku, Makindye-Ssabagabo',
    },
    {
      _id: '60d058c8048305120d2d615b',
      name: 'Mutundwe, Makindye Ssabagabo',
    },
    {
      _id: '60d058c8048305120d2d616c',
      name: 'Kasenge, Wakiso',
    },
  ];
  const [location, setLocation] = useState(undefined);
  const [inputSelect, setInputSelect] = useState(false);
  const [locationArray, setLocationArray] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState(gridLocationsData);
  const [loading, setLoading] = useState(false);

  const handleLocationEntry = (e) => {
    setInputSelect(false);
    filterBySearch(e);
    setLocation(e.target.value);
  };

  const filterBySearch = (e) => {
    const query = e.target.value;
    let locationList = [...gridLocationsData];
    locationList = locationList.filter((location) => {
      return location.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    setFilteredLocations(locationList);
  };

  const handleLocationSelect = (name) => {
    locationArray.includes(name)
      ? setLocationArray(locationArray.filter((location) => location !== name))
      : setLocationArray((locations) => [...locations, name]);
    setInputSelect(true);
    setLocation('');
  };

  const removeLocation = (name) => {
    setLocationArray(locationArray.filter((location) => location !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(setSelectedLocations(locationArray));
    setLoading(false);
  };

  useEffect(() => {
    if (gridLocationsData.length <= 0) {
      dispatch(getAllGridLocations());
      console.log('Grid locations', gridLocationsData);
    }
  }, [gridLocationsData]);

  return (
    <div className='sm:ml-3 lg:ml-1'>
      <ProgressComponent colorFirst={true} colorSecond={true} colorThird={true} />
      <div className='w-full'>
        <h2 className='text-3xl text-black font-semibold w-full lg:w-10/12 md:mt-20 lg:mt-2'>
          Choose locations you are interested in
        </h2>
        <form onSubmit={handleSubmit}>
          <div className='mt-6'>
            <div className='lg:w-11/12 sm:w-full md:w-full'>
              <div className='text-sm'>Add Locations</div>
              <div className='mt-2 w-full flex flex-row items-center justify-start '>
                <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
                  <SearchIcon />
                </div>
                <input
                  onChange={(e) => {
                    handleLocationEntry(e);
                  }}
                  value={location}
                  placeholder='Search locations'
                  className='input text-sm w-full h-12 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
                />
              </div>
              {location !== undefined && (
                <div
                  className={`bg-white max-h-48 overflow-y-scroll px-3 pt-2 pr-1 my-1 border border-input-light-outline rounded-md ${
                    inputSelect ? 'hidden' : 'relative'
                  }`}>
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
                      <div className='flex flex-row justify-start items-center mb-0.5 text-sm w-full'>
                        <LocationIcon />
                        <div
                          key={location._id}
                          className='text-sm ml-1 text-black hover:cursor-pointer'
                          onClick={() => {
                            handleLocationSelect(location.name);
                          }}>
                          {location.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span />
                  )}
                </div>
              )}
              <div className='mt-1 text-xs text-grey-350'>Minimum of 4 locations</div>
            </div>
          </div>
          {inputSelect && (
            <div className='mt-4 flex flex-row flex-wrap'>
              {locationArray.length > 0 ? (
                locationArray.map((location) => (
                  <div className='bg-green-150 flex flex-row items-center mr-2 px-2 py-1 rounded-xl mb-2'>
                    <span className='text-sm text-blue-600 font-semibold mr-1'>{location}</span>
                    <div onClick={() => removeLocation(location)} className='hover:cursor-pointer'>
                      <CloseIcon style={{ margin: '0 3px' }} />
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          )}
          <div className='mt-6'>
            {locationArray.length >= 4 ? (
              <div className='w-full'>
                <button
                  type='submit'
                  onClick={handleSubmit}
                  className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                  {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Continue'}
                </button>
              </div>
            ) : (
              <div className='w-full'>
                <button
                  type='submit'
                  className='w-full btn btn-disabled bg-white rounded-none text-sm outline-none border-none'>
                  Continue
                </button>
              </div>
            )}
          </div>
        </form>
        <div className='flex flex-row items-center justify-end mt-4'>
          <Link href='/account/creation/get-started'>
            <span className='text-sm text-blue-900 font-medium hover:cursor-pointer hover:text-blue-950'>
              Complete this later
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const CreateOrganisationDetails = () => {
  const [nextComponent, setNextComponent] = useState('pageOne');

  const handleSwitchTo = (page) => {
    setNextComponent(page);
  };

  useEffect(() => {
    setNextComponent('pageOne');
  }, []);

  return (
    <AccountPageLayout childrenHeight={'lg:h-[500]'} childrenTop={'mt-8'}>
      {nextComponent === 'pageOne' && (
        <CreateOrganisationDetailsPageOne handleComponentSwitch={() => handleSwitchTo('pageTwo')} />
      )}
      {nextComponent === 'pageTwo' && (
        <CreateOrganisationDetailsPageTwo
          handleComponentSwitch={() => handleSwitchTo('pageThree')}
        />
      )}
      {nextComponent === 'pageThree' && <CreateOrganisationDetailsPageThree />}
    </AccountPageLayout>
  );
};

export default CreateOrganisationDetails;
