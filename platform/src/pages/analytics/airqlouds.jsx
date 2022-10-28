import Layout from '@/components/Layout';
import {
  useGetCountryAirQloudsQuery,
  getRunningOperationPromises,
} from '@/lib/store/airQloudsApi';
import { wrapper } from '@/lib/store';
import ChevronRightIcon from '@/icons/chevron_right';
import ArrowDropDownIcon from '@/icons/arrow_drop_down.svg';
import { Fragment, useState } from 'react';
import { Menu, Tab, Transition } from '@headlessui/react';
import Spinner from '@/icons/spinner';

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (context) => {
    const name = context.params?.name;

    if (typeof name === 'string') {
      store.dispatch(useGetCountryAirQloudsQuery.initiate(name));
    }

    await Promise.all(getRunningOperationPromises());

    return {
      props: {},
    };
  },
);

const AIRQLOUD_REGIONS = [
  'All',
  'Central Region',
  'Eastern Region',
  'Northen Region',
  'Western Region',
];

const CountryAirQloudsDropdown = ({ airqlouds }) => {
  const [selectedCountryAirQloud, setSelectedCountryAirQloud] = useState(
    airqlouds[0],
  );
  const handleSetCountryAirQloud = (value) => setSelectedCountryAirQloud(value);

  return (
    <div className='max-h-44 w-44 h-full font-semibold'>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button className='inline-flex w-full justify-center rounded-md bg-transparent pr-4 py-2 text-sm font-medium text-black hover:bg-opacity-30 focus:outline-none'>
            {selectedCountryAirQloud.long_name}
            <ArrowDropDownIcon
              className='mt-2 ml-2 text-violet-200 hover:text-violet-100'
              aria-hidden='true'
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute z-50 left-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white opacity-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
            <div className='px-1 py-1 '>
              {airqlouds.map((airqloud) => (
                <Menu.Item
                  key={airqloud._id}
                  onClick={() => handleSetCountryAirQloud(airqloud)}
                >
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-[#145DFF] text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-base font-semibold`}
                    >
                      {airqloud.long_name}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

const RegionTabs = () => (
  <div className='w-full'>
    <Tab.Group>
      <Tab.List>
        {AIRQLOUD_REGIONS.map((region) => (
          <Tab
            key={region}
            className='ui-selected:border-b-2 ui-selected:border-b-black ui-selected:opacity-100 font-medium text-sm pb-1 cursor-pointer mr-[26px] opacity-40 outline-none'
          >
            {region}
          </Tab>
        ))}
        <hr className='w-full' />
      </Tab.List>
      {/* <Tab.Panels>
        <Tab.Panel>Content 1</Tab.Panel>
        <Tab.Panel>Content 2</Tab.Panel>
        <Tab.Panel>Content 3</Tab.Panel>
      </Tab.Panels> */}
    </Tab.Group>
  </div>
);

const AirQlouds = () => {
  const {
    data: airqlouds,
    isLoading,
    // isSuccess,
    // isError,
    // error,
  } = useGetCountryAirQloudsQuery();
  const countryAirqloudsData = !isLoading && airqlouds.airqlouds;
  console.log(countryAirqloudsData);

  return isLoading ? (
    <div className='w-screen h-screen flex items-center justify-center'>
      <Spinner />
    </div>
  ) : (
    <Layout>
      <div className='m-6'>
        <span className='flex items-center mb-[33px]'>
          <h3 className='text-xl font-medium text-black opacity-40 mr-3'>
            Analytics
          </h3>
          <ChevronRightIcon strokeWidth={1.5} stroke='#E3E3E3' />
          <h3 className='text-xl font-medium text-black ml-3'>AirQlouds</h3>
        </span>
        <div className='mb-5'>
          <CountryAirQloudsDropdown airqlouds={countryAirqloudsData} />
        </div>
        <div className='flex'>
          <RegionTabs />
        </div>
      </div>
    </Layout>
  );
};
export default AirQlouds;
