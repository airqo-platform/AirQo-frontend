import Layout from '@/components/Layout';
import Box from '@/components/Collocation/Report/box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/DataCompletenessTable';
import { wrapper } from '@/lib/store';
import {
  useGetCollocationResultsQuery,
  getRunningQueriesThunk,
  getCollocationResults,
} from '@/lib/store/services/collocation';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationChart';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { useState } from 'react';

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
  const name = context.params?.name;
  if (typeof name === 'string') {
    store.dispatch(getCollocationResults.initiate(name));
  }

  await Promise.all(store.dispatch(getRunningQueriesThunk()));

  return {
    props: {},
  };
});

const MonitorReport = ({ devices, startDate, endDate }) => {
  const router = useRouter();

  const {
    data: data,
    isLoading,
    // isSuccess,
    isError,
    error,
  } = useGetCollocationResultsQuery({
    devices: ['aq_g5_87'],
    startDate: '2023-01-21',
    endDate: '2023-01-25',
  });
  let collocationResults = data ? data.data : [];

  const [pollutantValue, setPollutantValue] = useState({
    label: 'pm2_5',
    value: '2.5',
  });
  const handlePollutantChange = (value) => {
    if (value === 'pm2_5') {
      setPollutantValue({
        label: 'pm2_5',
        value: '2.5',
      });
    } else {
      setPollutantValue({
        label: 'pm10',
        value: '10',
      });
    }
  };

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/reports'} navTitle={'Monitor Report'} />
      {!isLoading && (
        <>
          <Box
            isBigTitle
            title='Intra Sensor Correlation'
            subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
            contentLink='#'
          >
            <div className='flex flex-col justify-start w-full'>
              <Button className='capitalize max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
                <span>aq_g5_87</span>
                <span className='ml-2 text-purple-700'>
                  <ArrowDropDownIcon fillColor='#584CAB' />
                </span>
              </Button>

              <div className='dropdown w-full ml-4 mb-5'>
                <Button className={'mb-1 h-9 w-auto text-black font-medium text-sm'}>
                  <div className='mr-1 text-xs'>
                    <span>PM</span>
                    <sub>{pollutantValue.value}</sub>
                  </div>
                  <span className='flex items-center justify-center bg-grey-700 h-4 w-4 rounded-lg'>
                    <ArrowDropDownIcon fillColor='#000000' width='5.71' height='3' />
                  </span>
                </Button>
                <ul
                  tabIndex={0}
                  className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44'
                >
                  <li
                    role='button'
                    onClick={() => handlePollutantChange('pm2_5')}
                    className='text-sm text-grey leading-[21px]'
                  >
                    <a>PM2.5</a>
                  </li>
                  <li
                    role='button'
                    onClick={() => handlePollutantChange('pm10')}
                    className='text-sm text-grey leading-[21px]'
                  >
                    <a>PM10</a>
                  </li>
                </ul>
              </div>
              <CorrelationChart
                data={collocationResults.intra_sensor_correlation}
                pmConcentration={pollutantValue}
              />
            </div>
          </Box>
          <Box
            isBigTitle
            title='Data Completeness'
            subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
            contentLink='#'
          >
            <DataCompletenessTable dataCompletenessReults={collocationResults.data_completeness} />
          </Box>
        </>
      )}
    </Layout>
  );
};

export default MonitorReport;
