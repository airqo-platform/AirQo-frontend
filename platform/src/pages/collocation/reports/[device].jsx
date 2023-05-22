import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import Box from '@/components/Collocation/Report/box';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import { useEffect, useState } from 'react';
import CorrelationBarChart from '@/components/Collocation/Report/Charts/CorrelationBarChart';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import {
  useGetCollocationResultsQuery,
  useGetCollocationStatisticsQuery,
} from '@/lib/store/services/collocation';
import CustomTable from '@/components/Table';
import { isEmpty } from 'underscore';
import ContentBox from '@/components/Layout/content_box';
import CustomLegend from '@/components/Collocation/Report/MonitorReport/IntraCorrelation/custom_legend';

const Reports = () => {
  const router = useRouter();
  const { device, batchId } = router.query;

  const [deviceStatisticsInput, setDeviceStatisticsInput] = useState(null);
  const [skipCollocationResults, setSkipCollocationResults] = useState(true);
  const [skipStatistics, setSkipStatistics] = useState(true);
  const [input, setInput] = useState(null);
  const [deviceStatistics, setDeviceStatistics] = useState([]);
  const [pmConcentration, setPmConcentration] = useState('2.5');

  const {
    data: collocationResultsData,
    isLoading: isCollocationResultsLoading,
    isSuccess: isCollocationResultsSuccess,
    isError: isFetchCollocationResultsError,
  } = useGetCollocationResultsQuery(input, { skip: skipCollocationResults });
  const {
    data: collocationStatistics,
    isLoading: collocationStatisticsLoading,
    isSuccess: collocationStatisticsSuccess,
    isError: collocationStatisticsError,
  } = useGetCollocationStatisticsQuery(deviceStatisticsInput, { skip: skipStatistics });

  let collocationStatisticsList = collocationStatistics ? collocationStatistics.data : [];
  const collocationResultsList = collocationResultsData ? collocationResultsData.data : null;

  useEffect(() => {
    if (!device || !batchId) return;
    setInput({
      batchId,
    });
    setDeviceStatisticsInput({
      batchId,
    });

    setSkipCollocationResults(false);
    setSkipStatistics(false);
  }, [device, batchId]);

  useEffect(() => {
    if (!isEmpty(collocationStatisticsList)) {
      const transformedStatistics = Object.entries(collocationStatisticsList).map(
        ([deviceName, deviceData]) => ({
          deviceName,
          s1_pm2_5_mean: deviceData.s1_pm2_5_mean || 0,
          s2_pm2_5_mean: deviceData.s2_pm2_5_mean || 0,
          battery_voltage_mean: deviceData.battery_voltage_mean,
          internal_humidity_mean: deviceData.internal_humidity_mean || 0,
          internal_temperature_max: deviceData.internal_temperature_max || 0,
        }),
      );
      setDeviceStatistics(transformedStatistics);
    }
  }, [collocationStatisticsList]);

  const togglePmConcentrationChange = (newValue) => {
    setPmConcentration(newValue);
  };

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Reports'} />
      {(isFetchCollocationResultsError || collocationStatisticsError) && (
        <Toast
          type={'error'}
          timeout={20000}
          message="We're sorry, but our server is currently unavailable. We are working to resolve the issue and apologize for the inconvenience."
        />
      )}
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <Box
          title='Intra Sensor Correlation'
          subtitle='Detailed comparison of data between two sensors that are located within the same device.'
          contentLink={`/collocation/reports/monitor_report/${device}?device=${device}&batchId=${batchId}`}
        >
          <div className='flex flex-col justify-start w-full' data-testid='intra-correlation-chart'>
            <PollutantDropdown
              pollutantValue={pmConcentration}
              handlePollutantChange={togglePmConcentrationChange}
              options={[
                { value: '2.5', label: 'pm2_5' },
                { value: '10', label: 'pm10' },
              ]}
            />
            {isCollocationResultsLoading ? (
              <div className='mb-6'>
                <Spinner />
              </div>
            ) : (
              <>
                {isCollocationResultsSuccess && (
                  <>
                    <CorrelationChart
                      data={collocationResultsList}
                      pmConcentration={pmConcentration}
                      height={'210'}
                      isInterSensorCorrelation
                    />
                    <CustomLegend />
                  </>
                )}
              </>
            )}
          </div>
        </Box>
        <Box
          title='Intra Sensor Correlation'
          subtitle='Detailed comparison of data between two sensors that are located within the same device.'
          contentLink={`/collocation/reports/monitor_report/${device}?device=${device}&batchId=${batchId}`}
        >
          <div className='flex flex-col justify-start w-full' data-testid='intra-correlation-chart'>
            <PollutantDropdown
              pollutantValue={pmConcentration}
              handlePollutantChange={togglePmConcentrationChange}
              options={[
                { value: '2.5', label: 'pm2_5' },
                { value: '10', label: 'pm10' },
              ]}
            />
            {collocationStatisticsLoading ? (
              <div className='mb-6'>
                <Spinner />
              </div>
            ) : !isEmpty(deviceStatistics) ? (
              <>
                {collocationStatisticsSuccess && (
                  <>
                    <CorrelationBarChart
                      height={'210'}
                      pmConcentration={pmConcentration}
                      data={deviceStatistics}
                    />
                    <CustomLegend />
                  </>
                )}
              </>
            ) : (
              <div className='text-center text-xs text-grey-300'>
                Unable to calculate mean sensor values
              </div>
            )}
          </div>
        </Box>
      </div>
      <ContentBox>
        {(collocationStatisticsSuccess || collocationStatisticsLoading) && (
          <CustomTable
            headers={[
              'Monitor Name',
              'Sensor 01',
              'Sensor 02',
              'Voltage',
              'Internal Humidity',
              'Internal Temperature',
            ]}
            sortableColumns={['Sensor 01']}
            data={deviceStatistics}
            isLoading={collocationStatisticsLoading}
            type='device statistics'
          />
        )}
      </ContentBox>
    </Layout>
  );
};

export default Reports;
