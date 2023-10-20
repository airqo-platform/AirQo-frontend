import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import ProgressComponent from '@/components/Account/ProgressComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';
import { useDispatch } from 'react-redux';
import SearchIcon from '@/icons/Actions/search.svg';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';

const CreateOrganisationDetailsPageOne = ({ handleComponentSwitch }) => {
  const router = useRouter();
  const { id } = router.query;
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {};
  return (
    <div className='lg:mb-3 md:mb-5'>
      <ProgressComponent colorFirst={true} />
      <div className='w-full'>
        <h2 className='text-3xl text-black font-semibold lg:w-10/12 md:mt-20 lg:mt-2'>
          Tell us about your organisation
        </h2>
        <form>
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
              <div className='text-sm'>Website</div>
              <div className='mt-2 w-full flex flex-row'>
                <span className='bg-white border border-input-light-outline w-auto h-12 p-3 text-sm rounded-l-lg text-grey-350 font-normal'>
                  https://
                </span>
                {orgWebsite.length >= 3 && !orgWebsite.includes('.') ? (
                  <>
                    <input
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      type='text'
                      minLength={4}
                      className='w-full h-12 rounded-r-lg bg-white border-red-600 text-sm'
                      required
                    />
                    <div className='flex flex-row items-start text-xs text-grey-350 py-2'>
                      <HintIcon className='w-8 h-8 mx-1 stroke-grey-350' />
                      <span>Please provide a valid website!</span>
                    </div>
                  </>
                ) : (
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
                )}
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Details about your Organisation</div>
              <div className='mt-2 w-full flex flex-col justify-start'>
                <textarea
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
                  onClick={() => {
                    handleSubmit();
                    handleComponentSwitch();
                  }}
                  className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                  {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Continue'}
                </button>
              </div>
            ) : (
              <div className='w-full'>
                <button
                  type='submit'
                  onClick={handleSubmit}
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
  const [loading, setLoading] = useState(false);
  const countryList = ['Uganda', 'Kenya', 'Mozambique', 'Zimbabwe', 'Tanzania', 'Rwanda'];

  const handleSubmit = () => {};
  return (
    <div className='sm:ml-3 lg:ml-1'>
      <ProgressComponent colorFirst={true} colorSecond={true} />
      <div className='w-full'>
        <h2 className='text-3xl text-black font-semibold w-full lg:w-10/12 md:mt-20 lg:mt-2'>
          Tell us about your organization
        </h2>
        <form>
          <div className='mt-6'>
            <div className='lg:w-10/12 sm:w-full md:w-11/12'>
              <div className='text-sm'>Industry</div>
              <div className='mt-2 w-full'>
                <select className='w-full text-sm text-grey-350 font-normal select select-bordered outline-offset-0 border-input-light-outline focus-visible:border-input-outline'>
                  {countryList.map((country, key) => (
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
                <select className='w-full text-sm text-grey-350 font-normal select select-bordered outline-offset-0 border-input-light-outline focus-visible:border-input-outline'>
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
                onClick={() => {
                  handleSubmit();
                  handleComponentSwitch();
                }}
                className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Continue'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateOrganisationDetailsPageThree = () => {
  return (
    <div className='sm:ml-3 lg:ml-1'>
      <ProgressComponent colorFirst={true} colorSecond={true} colorThird={true} />
      <div className='w-full'>
        <h2 className='text-3xl text-black font-semibold w-full lg:w-10/12 md:mt-20 lg:mt-2'>
          Choose locations you are interested in
        </h2>
        <form>
          <div className='mt-6'>
            <div className='lg:w-11/12 sm:w-full md:w-full'>
              <div className='text-sm'>Add Locations</div>
              <div className='mt-2 w-full flex flex-row items-center justify-start '>
                <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
                  <SearchIcon />
                </div>
                <input
                  placeholder='Search locations'
                  className='input text-sm w-full h-12 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
                />
              </div>
              <div className='mt-1 text-xs text-grey-350'>Minimum of 4 locations</div>
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
