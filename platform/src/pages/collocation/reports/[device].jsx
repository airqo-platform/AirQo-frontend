import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import Box from '@/components/Collocation/Report/box';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import CustomTable from '@/components/Table';
import { isEmpty } from 'underscore';
import ContentBox from '@/components/Layout/content_box';
import CustomLegend from '@/components/Collocation/Report/MonitorReport/IntraCorrelation/custom_legend';
import withAuth from '@/core/utils/protectedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { getCollocationStatistics, getCollocationResults } from '@/lib/store/services/collocation';
import { withPermission } from '@/core/utils/protectedRoute';

const Reports = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { device, batchId } = router.query;

  const [deviceStatisticsInput, setDeviceStatisticsInput] = useState(null);
  const [input, setInput] = useState(null);
  const [deviceStatistics, setDeviceStatistics] = useState([]);
  const [pmConcentration, setPmConcentration] = useState('2.5');
  const [batchList, setBatchList] = useState([]);

  const {
    data: collocationResultsData,
    loading: isCollocationResultsLoading,
    fulfilled: isCollocationResultsSuccess,
    rejected: isFetchCollocationResultsError,
  } = useSelector((state) => state.collocation.collocationResults);

  const {
    data: collocationStatistics,
    loading: collocationStatisticsLoading,
    fulfilled: collocationStatisticsSuccess,
    rejected: collocationStatisticsError,
  } = useSelector((state) => state.collocation.collocationStatisticsData);

  let collocationStatisticsList = collocationStatistics ? collocationStatistics.data : [];

  const collocationResultsList = collocationResultsData ? collocationResultsData.data : null;

  let graphColors = [
    '#0e3b5d',
    '#0099ff',
    '#0874c5',
    '#06acff',
    '#461602',
    '#93380d',
    '#792e0e',
    '#b54808',
    '#022c1c',
    '#075e3a',
    '#074d32',
    '#057747',
    '#350e44',
    '#66297f',
    '#562669',
    '#7a309b',
    '#431d05',
    '#86480d',
    '#723b11',
    '#a35b05',
    '#fdc412',
    '#ffec89',
  ];

  useEffect(() => {
    if (!device || !batchId) return;
    setInput({
      batchId,
    });
    setDeviceStatisticsInput({
      batchId,
    });
  }, [device, batchId]);

  useEffect(() => {
    if (!isEmpty(deviceStatisticsInput)) {
      dispatch(getCollocationStatistics(deviceStatisticsInput));
    }
  }, [deviceStatisticsInput]);

  useEffect(() => {
    if (!isEmpty(input)) {
      dispatch(getCollocationResults(input));
    }
  }, [input]);

  useEffect(() => {
    if (!isEmpty(collocationStatisticsList)) {
      const batchList = Object.entries(collocationStatisticsList).map(
        ([deviceName, deviceData]) => ({
          device_name: deviceName,
        }),
      );
      setBatchList(batchList);
      const transformedStatistics = Object.entries(collocationStatisticsList).map(
        ([deviceName, deviceData]) => ({
          deviceName,
          pm2_5_mean: deviceData.pm2_5_mean || 0,
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
    <Layout topbarTitle={'Collocation'} pageTitle={'Collocation Reports'}>
      <NavigationBreadCrumb navTitle={'Reports'} />
      {(isFetchCollocationResultsError || collocationStatisticsError) && (
        <Toast
          type={'error'}
          timeout={20000}
          message="We're sorry, but our server is currently unavailable. We are working to resolve the issue and apologize for the inconvenience"
        />
      )}
      <ContentBox>
        {deviceStatistics && (
          <CustomTable
            headers={[
              'Monitor Name',
              'Mean Sensor Reading',
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
      <div className='grid grid-cols-1'>
        <Box
          title='Intra Sensor Correlation'
          dropdownItems={[
            {
              type: 'path',
              label: 'View monitor report',
              link: `/collocation/reports/monitor_report/${device}?device=${device}&batchId=${batchId}`,
            },
            {
              type: 'event',
              label: 'Change chart type',
              event: () => {
                console.log('I am an event');
              },
            },
          ]}
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
                {collocationResultsList && !isEmpty(collocationResultsList) && (
                  <>
                    <CorrelationChart
                      data={collocationResultsList}
                      pmConcentration={pmConcentration}
                      height={'210'}
                      isInterSensorCorrelation
                      graphColors={graphColors}
                    />
                    {batchList && graphColors && (
                      <CustomLegend isDeviceLegend devices={batchList} graphColors={graphColors} />
                    )}
                  </>
                )}

                {isEmpty(collocationResultsList) && (
                  <div className='text-center pb-6 text-grey-300 text-sm'>No data found</div>
                )}
              </>
            )}
          </div>
        </Box>
      </div>
    </Layout>
  );
};

export default withPermission(withAuth(Reports), 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
