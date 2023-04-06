import Layout from '@/components/Layout';
import HeaderNav from '@/components/Collocation/header';
import Box from '@/components/Collocation/Report/box';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import { useEffect, useState } from 'react';
import {
  useGetCollocationResultsMutation,
  useGetIntraSensorCorrelationMutation,
  getRunningQueriesThunk,
} from '@/lib/store/services/collocation';
import ContentBox from '@/components/Layout/content_box';
import CustomTable from '@/components/Table';
import CorrelationBarChart from '@/components/Collocation/Report/Charts/CorrelationBarChart';
import moment from 'moment';
import { wrapper } from '@/lib/store';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';

const Reports = () => {
  const router = useRouter();
  const { device, startDate, endDate } = router.query;

  const [intraSensorCorrelationResults, setIntraSensorCorrelationResults] = useState(null);
  const [collocationResults, setCollocationResults] = useState(null);

  const [
    getIntraSensorCorrelationData,
    {
      isLoading: isIntraSensorCorrelationDataLoading,
      isSuccess: isIntraSensorCorrelationDataSuccess,
    },
  ] = useGetIntraSensorCorrelationMutation();
  const [
    getCollocationResultsData,
    { isLoading: isCollocationResultsLoading, isSuccess: isCollocationResultsSuccess },
  ] = useGetCollocationResultsMutation();

  useEffect(() => {
    const fetchIntraSensorCorrelationData = async () => {
      if (!device || !startDate || !endDate) return;
      const response = await getIntraSensorCorrelationData({
        devices: [device],
        startDate,
        endDate,
      });

      if (!response.error) {
        setIntraSensorCorrelationResults(response.data.data);
      }
    };
    fetchIntraSensorCorrelationData();
  }, [getIntraSensorCorrelationData, device, startDate, endDate]);

  useEffect(() => {
    const fetchCollocationResults = async () => {
      if (!device || !startDate || !endDate) return;
      const response = await getCollocationResultsData({
        devices: device,
        startDate,
        endDate,
      });

      if (!response.error) {
        setCollocationResults(response.data.data);
      }
    };
    fetchCollocationResults();
  }, [getCollocationResultsData, device, startDate, endDate]);

  const [pmConcentration, setPmConcentration] = useState('10');

  const togglePmConcentrationChange = (newValue) => {
    setPmConcentration(newValue);
  };

  return (
    <Layout>
      <HeaderNav component={'Reports'} />
      {(!isIntraSensorCorrelationDataSuccess || !isCollocationResultsSuccess) && (
        <Toast
          type={'error'}
          timeout={20000}
          message="We're sorry, but our server is currently unavailable. We are working to resolve the issue and apologize for the inconvenience."
        />
      )}
      <>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          {!isCollocationResultsLoading && collocationResults && (
            <Box
              title='Intra Sensor Correlation'
              subtitle='Detailed comparison of data between two sensors that are located within the same device.'
            >
              <div
                className='flex flex-col justify-start w-full'
                data-testid='intra-correlation-chart'
              >
                <PollutantDropdown
                  pollutantValue={pmConcentration}
                  handlePollutantChange={togglePmConcentrationChange}
                  options={[
                    { value: '2.5', label: 'pm2_5' },
                    { value: '10', label: 'pm10' },
                  ]}
                />
                <CorrelationChart
                  data={collocationResults}
                  pmConcentration={pmConcentration}
                  height={'210'}
                  isInterSensorCorrelation
                />
              </div>
            </Box>
          )}
          {!isIntraSensorCorrelationDataLoading && intraSensorCorrelationResults && (
            <Box
              title='Intra Sensor Correlation'
              subtitle='Detailed comparison of data between two sensors that are located within the same device.'
            >
              <div
                className='flex flex-col justify-start w-full'
                data-testid='intra-correlation-chart'
              >
                <PollutantDropdown
                  pollutantValue={pmConcentration}
                  handlePollutantChange={togglePmConcentrationChange}
                  options={[
                    { value: '2.5', label: 'pm2_5' },
                    { value: '10', label: 'pm10' },
                  ]}
                />
                <CorrelationBarChart
                  height={'210'}
                  pmConcentration={pmConcentration}
                  data={intraSensorCorrelationResults}
                />
              </div>
            </Box>
          )}
        </div>
      </>
    </Layout>
  );
};

export default Reports;
