import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/MonitorReport/DataCompletenessTable';
import {
  useGetCollocationResultsMutation,
  useGetDataCompletenessResultsMutation,
  useGetDeviceStatusSummaryQuery,
} from '@/lib/store/services/collocation';
import { useEffect, useState } from 'react';
import InterCorrelationChart from '@/components/Collocation/Report/MonitorReport/InterCorrelation';
import IntraCorrelationChart from '@/components/Collocation/Report/MonitorReport/IntraCorrelation';
import Toast from '@/components/Toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  addActiveSelectedDeviceCollocationReportData,
  addActiveSelectedDeviceReport,
} from '@/lib/store/services/collocation/collocationDataSlice';

const MonitorReport = () => {
  const dispatch = useDispatch();

  const activeSelectedDeviceCollocationReportData = useSelector(
    (state) => state.collocationData.activeSelectedDeviceCollocationReportData,
  );
  const activeSelectedDeviceReport = useSelector(
    (state) => state.collocationData.activeSelectedDeviceReport,
  );

  const router = useRouter();
  const { device, startDate, endDate } = router.query;

  const [dataCompletenessResults, setDataCompletenessResults] = useState(null);

  const [
    getCollocationResultsData,
    {
      isError: isFetchCollocationResultsError,
      isSuccess: isFetchCollocationResultsSuccess,
      isLoading: isFetchCollocationResultsLoading,
    },
  ] = useGetCollocationResultsMutation();
  const [
    getDataCompletenessResults,
    {
      isError: isFetchDataCompletenessError,
      isSuccess: isFetchDataCompletenessSuccess,
      isLoading: isFetchDataCompletenessLoading,
    },
  ] = useGetDataCompletenessResultsMutation();
  const {
    data: data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummary = data ? data.data : [];

  let passedDevices = deviceStatusSummary.filter((device) => device.status === 'passed');

  useEffect(() => {
    const fetchCollocationResults = async () => {
      if (!device || !startDate || !endDate) return;
      const response = await getCollocationResultsData({
        devices: device,
        startDate,
        endDate,
      });

      if (!response.error) {
        dispatch(addActiveSelectedDeviceCollocationReportData(response.data.data));
      }
    };
    fetchCollocationResults();
  }, [getCollocationResultsData, device, startDate, endDate]);

  useEffect(() => {
    const fetchDataCompletenessResults = async () => {
      if (!device || !startDate || !endDate) return;
      const response = await getDataCompletenessResults({
        devices: [device],
        startDate,
        endDate,
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
      <div data-testid='correlation-chart'>
        <IntraCorrelationChart
          collocationResults={activeSelectedDeviceCollocationReportData}
          intraCorrelationConcentration={intraCorrelationConcentration}
          toggleIntraCorrelationConcentrationChange={toggleIntraCorrelationConcentrationChange}
          isLoading={isFetchCollocationResultsLoading}
          deviceList={passedDevices}
        />

        <InterCorrelationChart
          collocationResults={activeSelectedDeviceCollocationReportData}
          interCorrelationConcentration={interCorrelationConcentration}
          toggleInterCorrelationConcentrationChange={toggleInterCorrelationConcentrationChange}
          correlationDevices={correlationDevices}
          deviceList={passedDevices}
          isLoading={isFetchCollocationResultsLoading}
        />
      </div>

      <DataCompletenessTable
        dataCompletenessResults={dataCompletenessResults}
        isLoading={isFetchDataCompletenessLoading}
      />
    </Layout>
  );
};

export default MonitorReport;
