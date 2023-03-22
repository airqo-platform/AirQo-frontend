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
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
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
    isSuccess,
    isError,
    error,
  } = useGetCollocationResultsQuery({
    devices: ['aq_g5_87'],
    startDate: '2023-01-21',
    endDate: '2023-01-25',
  });
  let collocationResults = data ? data.data : [];

  const [intraCorrelationConcentration, setIntraCorrelationConcentration] = useState('2.5');
  const [interCorrelationConcentration, setInterCorrelationConcentration] = useState('2.5');

  const toggleIntraCorrelationConcentrationChange = (newValue) => {
    setIntraCorrelationConcentration(newValue);
  };

  const toggleInterCorrelationConcentrationChange = (newValue) => {
    setInterCorrelationConcentration(newValue);
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
              <Button className='max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
                <span className='uppercase'>aq_g5_87</span>
                <span className='ml-2 text-purple-700'>
                  <ArrowDropDownIcon fillColor='#584CAB' />
                </span>
              </Button>
              <PollutantDropdown
                pollutantValue={intraCorrelationConcentration}
                handlePollutantChange={toggleIntraCorrelationConcentrationChange}
                options={[
                  { value: '2.5', label: 'pm2_5' },
                  { value: '10', label: 'pm10' },
                ]}
              />
              <CorrelationChart
                data={collocationResults.intra_sensor_correlation}
                pmConcentration={intraCorrelationConcentration}
              />
            </div>
          </Box>
          <Box
            isBigTitle
            title='Inter Sensor Correlation'
            subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
            contentLink='#'
          >
            <div className='flex flex-col justify-start w-full'>
              <Button className='max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
                <span className='uppercase'>aq_g5_87</span>
                <span className='ml-2 text-purple-700'>
                  <ArrowDropDownIcon fillColor='#584CAB' />
                </span>
              </Button>
              <PollutantDropdown
                pollutantValue={interCorrelationConcentration}
                handlePollutantChange={toggleInterCorrelationConcentrationChange}
                options={[
                  { value: '2.5', label: 'pm2_5' },
                  { value: '10', label: 'pm10' },
                ]}
              />
              <CorrelationChart
                data={collocationResults.intra_sensor_correlation}
                pmConcentration={interCorrelationConcentration}
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
