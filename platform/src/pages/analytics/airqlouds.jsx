import Layout from '@/components/Layout';
import {
  useGetAllAirQloudsQuery,
  getRunningOperationPromises,
} from '@/lib/store/airQloudsApi';
import { wrapper } from '@/lib/store';
import ChevronRightIcon from '@/icons/chevron_right';
import { useDispatch } from 'react-redux';
import { setCurrentAirqloud } from '@/lib/store/currentAirqloudSlice';
import { useState } from 'react';
import { Tab } from '@headlessui/react';

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (context) => {
    const name = context.params?.name;

    if (typeof name === 'string') {
      store.dispatch(useGetAllAirQloudsQuery.initiate(name));
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

const RegionTabs = () => {
  const [active, setActive] = useState(false);
  const toggleTab = () => setActive(!active);
  return (
    <Tab.Group>
      <Tab.List>
        {AIRQLOUD_REGIONS.map((region) => (
          <Tab className='ui-active:border-b-2 ui-active:border-b-black pb-1 cursor-pointer mr-[26px]'>
            {region}
          </Tab>
        ))}
      </Tab.List>
      {/* <Tab.Panels>
        <Tab.Panel>Content 1</Tab.Panel>
        <Tab.Panel>Content 2</Tab.Panel>
        <Tab.Panel>Content 3</Tab.Panel>
      </Tab.Panels> */}
    </Tab.Group>
  );
};

const AirQlouds = () => {
  const dispatch = useDispatch();

  const {
    data: airqloudsResData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAllAirQloudsQuery();
  const airqlouds = !isLoading && airqloudsResData.airqlouds;

  console.log(airqlouds);

  const handleChange = (airqloud) => {
    dispatch(setCurrentAirqloud(JSON.parse(airqloud)));
  };

  return (
    <Layout>
      <div className='m-6'>
        <span className='flex items-center mb-[33px]'>
          <h3 className='text-xl font-medium text-black opacity-40 mr-3'>
            Analytics
          </h3>
          <ChevronRightIcon strokeWidth={1.5} stroke='#E3E3E3' />
          <h3 className='text-xl font-medium text-black ml-3'>AirQlouds</h3>
        </span>
        <div>
          {!isLoading && (
            <select
              name='airqlouds-dropdown'
              id='airqlouds-dropdown'
              className='outline-none border-none bg-transparent text-base font-semibold text-black'
              onChange={(e) => handleChange(e.target.value)}
            >
              {airqlouds.map((airqloud) => (
                <option key={airqloud._id} value={JSON.stringify(airqloud)}>
                  {airqloud.long_name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className='flex'>
          <RegionTabs />
        </div>
      </div>
    </Layout>
  );
};
export default AirQlouds;
