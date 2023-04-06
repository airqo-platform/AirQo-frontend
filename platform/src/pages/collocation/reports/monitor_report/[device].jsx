import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/MonitorReport/DataCompletenessTable';
import {
  useGetCollocationResultsMutation,
  useGetDataCompletenessResultsMutation,
} from '@/lib/store/services/collocation';
import { useEffect, useState } from 'react';
import InterCorrelationChart from '@/components/Collocation/Report/MonitorReport/InterCorrelation';
import IntraCorrelationChart from '@/components/Collocation/Report/MonitorReport/IntraCorrelation';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';

const MonitorReport = () => {
  const router = useRouter();
  const { device, startDate, endDate } = router.query;

  const [collocationResults, setCollocationResults] = useState(null);
  const [dataCompletenessResults, setDataCompletenessResults] = useState(null);

  const [
    getCollocationResultsData,
    { isError: isFetchCollocationResultsError, isSuccess: isFetchCollocationResultsSuccess },
  ] = useGetCollocationResultsMutation();
  const [
    getDataCompletenessResults,
    { isError: isFetchDataCompletenessError, isSuccess: isFetchDataCompletenessSuccess },
  ] = useGetDataCompletenessResultsMutation();

  useEffect(() => {
    const fetchCollocationResults = async () => {
      if (!device || !startDate || !endDate) return;
      const response = await getCollocationResultsData({
        devices: device,
        startDate: startDate,
        endDate: endDate,
      });

      if (!response.error) {
        setCollocationResults(response.data.data);
      }
    };
    fetchCollocationResults();
  }, [getCollocationResultsData, device, startDate, endDate]);

  useEffect(() => {
    const fetchDataCompletenessResults = async () => {
      if (!device || !startDate || !endDate) return;
      const response = await getDataCompletenessResults({
        devices: [device],
        startDate: startDate,
        endDate: endDate,
        expectedRecordsPerHour: 24,
      });

      if (!response.error) {
        setDataCompletenessResults(response.data.data);
      }
    };
    fetchDataCompletenessResults();
  }, [getDataCompletenessResults, device, startDate, endDate]);

  const [correlationDevices, setCorrelationDevices] = useState([device]);
  const [intraCorrelationConcentration, setIntraCorrelationConcentration] = useState('10');
  const [interCorrelationConcentration, setInterCorrelationConcentration] = useState('10');

  const toggleIntraCorrelationConcentrationChange = (newValue) => {
    setIntraCorrelationConcentration(newValue);
  };

  const toggleInterCorrelationConcentrationChange = (newValue) => {
    setInterCorrelationConcentration(newValue);
  };

  return (
    <Layout>
      <NavigationBreadCrumb
        backLink={`/collocation/reports/${device}?device=${device}&startDate=${startDate}&endDate=${endDate}`}
        navTitle={'Monitor Report'}
      />
      {(isFetchCollocationResultsError || isFetchDataCompletenessError) && (
        <Toast
          type={'error'}
          timeout={20000}
          message="We're sorry, but our server is currently unavailable. We are working to resolve the issue and apologize for the inconvenience."
          dataTestId={'monitor-report-error-toast'}
        />
      )}
      {isFetchCollocationResultsSuccess && collocationResults ? (
        <>
          <IntraCorrelationChart
            collocationResults={collocationResults}
            intraCorrelationConcentration={intraCorrelationConcentration}
            toggleIntraCorrelationConcentrationChange={toggleIntraCorrelationConcentrationChange}
            deviceName={device}
          />

          <InterCorrelationChart
            collocationResults={collocationResults}
            interCorrelationConcentration={interCorrelationConcentration}
            toggleInterCorrelationConcentrationChange={toggleInterCorrelationConcentrationChange}
            correlationDevices={correlationDevices}
            deviceName={device}
            startDate={startDate}
            endDate={endDate}
          />
        </>
      ) : (
        <div className='h-20'>
          <Spinner />
        </div>
      )}

      {isFetchDataCompletenessSuccess && dataCompletenessResults ? (
        <DataCompletenessTable dataCompletenessResults={dataCompletenessResults} />
      ) : (
        <div className='h-20'>
          <Spinner />
        </div>
      )}
    </Layout>
  );
};

export default MonitorReport;
