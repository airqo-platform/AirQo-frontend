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
  useGetIntraSensorCorrelationQuery,
} from '@/lib/store/services/collocation';

const Reports = () => {
  const router = useRouter();
  const { device, batchId } = router.query;

  const [skipIntraSensorCorrelation, setSkipIntraSensorCorrelation] = useState(true);
  const [skipCollocationResults, setSkipCollocationResults] = useState(true);
  const [input, setInput] = useState(null);
  const [pmConcentration, setPmConcentration] = useState('10');

  const {
    data: intraSensorCorrelationData,
    isLoading: isIntraSensorCorrelationDataLoading,
    isSuccess: isIntraSensorCorrelationDataSuccess,
    isError: isFetchIntraSensorCorrelationDataError,
  } = useGetIntraSensorCorrelationQuery(input, { skip: skipIntraSensorCorrelation });
  const {
    data: collocationResultsData,
    isLoading: isCollocationResultsLoading,
    isSuccess: isCollocationResultsSuccess,
    isError: isFetchCollocationResultsError,
  } = useGetCollocationResultsQuery(input, { skip: skipCollocationResults });

  const intraSensorCorrelationList = intraSensorCorrelationData
    ? intraSensorCorrelationData.data
    : null;
  const collocationResultsList = collocationResultsData ? collocationResultsData.data : null;

  useEffect(() => {
    if (!device || !batchId) return;
    setInput({
      devices: [device],
      batchId,
    });
    setSkipIntraSensorCorrelation(false);
    setSkipCollocationResults(false);
  }, [device, batchId]);

  const togglePmConcentrationChange = (newValue) => {
    setPmConcentration(newValue);
  };

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Reports'} />
      {(isFetchCollocationResultsError || isFetchIntraSensorCorrelationDataError) && (
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
                  <CorrelationChart
                    data={collocationResultsList}
                    pmConcentration={pmConcentration}
                    height={'210'}
                    isInterSensorCorrelation
                  />
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
            {isIntraSensorCorrelationDataLoading ? (
              <div className='mb-6'>
                <Spinner />
              </div>
            ) : (
              <>
                {isIntraSensorCorrelationDataSuccess && (
                  <CorrelationBarChart
                    height={'210'}
                    pmConcentration={pmConcentration}
                    data={intraSensorCorrelationList}
                  />
                )}
              </>
            )}
          </div>
        </Box>
      </div>
    </Layout>
  );
};

export default Reports;
