import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import ProgressComponent from '@/components/Account/ProgressComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '@/icons/Common/search_md.svg';
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
import CloseIcon from '@/icons/close_icon';
import { getSitesSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import countries from 'i18n-iso-countries';
import englishLocale from 'i18n-iso-countries/langs/en.json';
import {
  setCustomisedLocations,
  updateUserPreferences,
  postUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import InfoCircle from '@/icons/Alerts/info_circle';

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
    const createPreference = {
      user_id: id,
    };
    try {
      const response = await dispatch(postOrganisationCreationDetails(orgData));
      if (!response.payload.success) {
        setCreationErrors({
          state: true,
          message: response.payload.response.data.message,
        });
      } else {
        try {
          const response = await dispatch(postUserPreferences(createPreference));
          if (response.payload.success) {
            handleComponentSwitch();
          } else {
            setCreationError({
              state: true,
              message: response.payload.message,
            });
          }
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
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
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgCountry, setOrgCountry] = useState('');
  const [orgTimeZone, setOrgTimeZone] = useState('');
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });
  const orgDetails = useSelector((state) => state.creation.org_creation_response);
  const organisationId = orgDetails._id;
  countries.registerLocale(englishLocale);
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
  const countryList = countries.getNames('en', { select: 'official' });
  const timeZoneList = [
    '(UTC-12:00) International Date Line West',
    '(UTC-11:00) Coordinated Universal Time-11',
    '(UTC-10:00) Hawaii',
    '(UTC-09:00) Alaska',
    '(UTC-08:00) Baja California',
    '(UTC-08:00) Pacific Time (US and Canada)',
    '(UTC-07:00) Chihuahua, La Paz, Mazatlan',
    '(UTC-07:00) Arizona',
    '(UTC-07:00) Mountain Time (US and Canada)',
    '(UTC-06:00) Central America',
    '(UTC-06:00) Central Time (US and Canada)',
    '(UTC-06:00) Saskatchewan',
    '(UTC-06:00) Guadalajara, Mexico City, Monterey',
    '(UTC-05:00) Bogota, Lima, Quito',
    '(UTC-05:00) Indiana (East)',
    '(UTC-05:00) Eastern Time (US and Canada)',
    '(UTC-04:30) Caracas',
    '(UTC-04:00) Atlantic Time (Canada)',
    '(UTC-04:00) Asuncion',
    '(UTC-04:00) Georgetown, La Paz, Manaus, San Juan',
    '(UTC-04:00) Cuiaba',
    '(UTC-04:00) Santiago',
    '(UTC-03:30) Newfoundland',
    '(UTC-03:00) Brasilia',
    '(UTC-03:00) Greenland',
    '(UTC-03:00) Cayenne, Fortaleza',
    '(UTC-03:00) Buenos Aires',
    '(UTC-03:00) Montevideo',
    '(UTC-02:00) Coordinated Universal Time-2',
    '(UTC-01:00) Cape Verde',
    '(UTC-01:00) Azores',
    '(UTC+00:00) Casablanca',
    '(UTC+00:00) Monrovia, Reykjavik',
    '(UTC+00:00) Dublin, Edinburgh, Lisbon, London',
    '(UTC+00:00) Coordinated Universal Time',
    '(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
    '(UTC+01:00) Brussels, Copenhagen, Madrid, Paris',
    '(UTC+01:00) West Central Africa',
    '(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague',
    '(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb',
    '(UTC+01:00) Windhoek',
    '(UTC+02:00) Athens, Bucharest, Istanbul',
    '(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
    '(UTC+02:00) Cairo',
    '(UTC+02:00) Damascus',
    '(UTC+02:00) Amman',
    '(UTC+02:00) Harare, Pretoria',
    '(UTC+02:00) Jerusalem',
    '(UTC+02:00) Beirut',
    '(UTC+03:00) Baghdad',
    '(UTC+03:00) Minsk',
    '(UTC+03:00) Kuwait, Riyadh',
    '(UTC+03:00) Nairobi',
    '(UTC+03:30) Tehran',
    '(UTC+04:00) Moscow, St. Petersburg, Volgograd',
    '(UTC+04:00) Tbilisi',
    '(UTC+04:00) Yerevan',
    '(UTC+04:00) Abu Dhabi, Muscat',
    '(UTC+04:00) Baku',
    '(UTC+04:00) Port Louis',
    '(UTC+04:30) Kabul',
    '(UTC+05:00) Tashkent',
    '(UTC+05:00) Islamabad, Karachi',
    '(UTC+05:30) Sri Jayewardenepura Kotte',
    '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
    '(UTC+05:45) Kathmandu',
    '(UTC+06:00) Astana',
    '(UTC+06:00) Dhaka',
    '(UTC+06:00) Yekaterinburg',
    '(UTC+06:30) Yangon',
    '(UTC+07:00) Bangkok, Hanoi, Jakarta',
    '(UTC+07:00) Novosibirsk',
    '(UTC+08:00) Krasnoyarsk',
    '(UTC+08:00) Ulaanbaatar',
    '(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi',
    '(UTC+08:00) Perth',
    '(UTC+08:00) Kuala Lumpur, Singapore',
    '(UTC+08:00) Taipei',
    '(UTC+09:00) Irkutsk',
    '(UTC+09:00) Seoul',
    '(UTC+09:00) Osaka, Sapporo, Tokyo',
    '(UTC+09:30) Darwin',
    '(UTC+09:30) Adelaide',
    '(UTC+10:00) Hobart',
    '(UTC+10:00) Yakutsk',
    '(UTC+10:00) Brisbane',
    '(UTC+10:00) Guam, Port Moresby',
    '(UTC+10:00) Canberra, Melbourne, Sydney',
    '(UTC+11:00) Vladivostok',
    '(UTC+11:00) Solomon Islands, New Caledonia',
    '(UTC+12:00) Coordinated Universal Time+12',
    '(UTC+12:00) Fiji, Marshall Islands',
    '(UTC+12:00) Magadan',
    '(UTC+12:00) Auckland, Wellington',
    '(UTC+13:00) Nuku’alofa',
    '(UTC+13:00) Samoa',
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
      grp_timezone: orgTimeZone,
      grp_id: organisationId,
    };
    dispatch(setOrgUpdateDetails(orgData));
    try {
      const response = await dispatch(updateOrganisationDetails(orgData, organisationId));
      if (!response.payload.success) {
        setCreationErrors({
          state: true,
          message: response.payload.response.data.message,
        });
        setLoading(false);
      } else {
        handleComponentSwitch();
      }
    } catch (error) {
      throw error;
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
                  onChange={(e) => setOrgIndustry(e.target.value)}>
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
                  onChange={(e) => setOrgCountry(e.target.value)}>
                  {Object.entries(countryList).map(([code, country], key) => (
                    <option key={code} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Timezone</div>
              <div className='mt-2 w-full'>
                <select
                  className='w-full text-sm text-grey-350 font-normal select select-bordered outline-offset-0 border-input-light-outline focus-visible:border-input-outline'
                  onChange={(e) => setOrgTimeZone(e.target.value)}>
                  {timeZoneList.map((zone, key) => (
                    <option key={key} value={zone}>
                      {zone}
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
  const router = useRouter();
  // const gridLocationsState = useSelector((state) => state.grids.gridLocations);
  // const gridSitesLocations = gridLocationsState.map((grid) => grid.sites);
  // const gridLocationsData = [].concat(...gridSitesLocations);
  const gridsData = useSelector((state) => state.grids.sitesSummary);
  const gridLocationsData = (gridsData && gridsData.sites) || [];
  const { id } = router.query;
  const [location, setLocation] = useState('');
  const [inputSelect, setInputSelect] = useState(false);
  const [locationArray, setLocationArray] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState(gridLocationsData);
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });

  const handleLocationEntry = (e) => {
    setInputSelect(false);
    filterBySearch(e);
    setLocation(e.target.value);
  };

  const filterBySearch = (e) => {
    const query = e.target.value.toLowerCase();
    const locationList = gridLocationsData.filter((location) => {
      return location.name.toLowerCase().includes(query);
    });
    setFilteredLocations(locationList);
  };

  const handleLocationSelect = (item) => {
    const newLocationArray = [...locationArray];
    const index = newLocationArray.findIndex((location) => location._id === item._id);

    if (index !== -1) {
      newLocationArray.splice(index, 1);
    } else {
      newLocationArray.push(item);
    }

    setLocationArray(newLocationArray);
    setInputSelect(true);
    setLocation('');
  };

  const removeLocation = (item) => {
    setLocationArray(locationArray.filter((location) => location._id !== item._id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      user_id: id,
      selected_sites: locationArray,
    };
    dispatch(setCustomisedLocations(data));
    try {
      const response = await dispatch(updateUserPreferences(data));
      if (!response.payload.success) {
        setCreationErrors({
          state: true,
          message: response.payload.message,
        });
      } else {
        router.push('/account/creation/get-started');
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const toggleInputSelect = () => {
    setFilteredLocations(gridLocationsData);
    setInputSelect(!inputSelect);
  };

  useEffect(() => {
    if (!gridLocationsData.length) {
      dispatch(getSitesSummary());
    }
  }, [gridLocationsData]);

  return (
    <div className='sm:ml-3 lg:ml-1 relative h-[600px]'>
      <ProgressComponent colorFirst={true} colorSecond={true} colorThird={true} />
      <div className='w-full h-full'>
        <h2 className='text-3xl text-black font-semibold w-full lg:w-10/12 md:mt-20 lg:mt-2'>
          Choose locations you are interested in
        </h2>
        <form onSubmit={handleSubmit} className='h-full'>
          {creationErrors.state && (
            <Toast type={'error'} timeout={6000} message={creationErrors.message} />
          )}
          <div className='mt-6'>
            <div className='w-full'>
              <div className='text-sm'>Add Locations</div>
              <div className='mt-2 w-full flex flex-row items-center justify-start '>
                <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
                  <SearchIcon />
                </div>
                <input
                  onChange={(e) => {
                    handleLocationEntry(e);
                  }}
                  onClick={() => toggleInputSelect()}
                  value={location}
                  placeholder='Search locations'
                  className='input text-sm w-full h-12 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
                />
              </div>
              {location !== '' && (
                <div
                  className={`bg-white max-h-48 overflow-y-scroll px-3 pt-2 pr-1 my-1 border border-input-light-outline rounded-md ${
                    inputSelect ? 'hidden' : 'relative'
                  }`}>
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location, key) => (
                      <div
                        className='flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer'
                        onClick={() => {
                          handleLocationSelect(location);
                        }}
                        key={key}>
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
              <div className='mt-1 flex space-x-1 text-xs text-grey-350'>
                <InfoCircle />
                <span>Select any 4 locations</span>
              </div>
            </div>
          </div>
          {inputSelect && (
            <div className='mt-4 flex flex-row flex-wrap overflow-y-clip'>
              {locationArray.length > 0 ? (
                locationArray.map((location, key) => (
                  <div
                    className='bg-green-150 flex flex-row items-center mr-2 px-3 py-1 rounded-xl mb-2'
                    key={key}>
                    <span className='text-sm text-blue-600 font-semibold mr-1'>
                      {location.name}
                    </span>
                    <div onClick={() => removeLocation(location)} className='hover:cursor-pointer'>
                      <span className='mt-[4px]'>
                        <CloseIcon fill='#145FFF' strokeWidth='2' width={16} height={16} />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          )}
          <div className='absolute w-full bottom-6'>
            <div className='mt-6 relative w-auto'>
              {locationArray.length === 4 ? (
                <div className='w-full'>
                  <button
                    type='submit'
                    onClick={handleSubmit}
                    className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                    {loading ? (
                      <Spinner data-testid='spinner' width={25} height={25} />
                    ) : (
                      'Continue'
                    )}
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
            <div className='flex flex-row items-center justify-end mt-4 relative'>
              <Link href='/account/creation/get-started'>
                <span className='text-sm text-blue-900 font-medium hover:cursor-pointer hover:text-blue-950'>
                  Complete this later
                </span>
              </Link>
            </div>
          </div>
        </form>
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
