import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/MonitorReport/DataCompletenessTable';
import { useGetDeviceStatusSummaryQuery } from '@/lib/store/services/collocation';
import { useEffect, useState } from 'react';
import InterCorrelationChart from '@/components/Collocation/Report/MonitorReport/InterCorrelation';
import IntraCorrelationChart from '@/components/Collocation/Report/MonitorReport/IntraCorrelation';
import Toast from '@/components/Toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  addActiveSelectedDeviceCollocationReportData,
  addActiveSelectedDeviceReport,
} from '@/lib/store/services/collocation/collocationDataSlice';
import {
  useGetCollocationResultsQuery,
  useGetDataCompletenessResultsQuery,
  useGetInterSensorCorrelationQuery,
} from '@/lib/store/services/collocation';
import { isEmpty } from 'underscore';
import Spinner from '@/components/Spinner';
import ContentBox from '@/components/Layout/content_box';
import { generateRandomColors } from '@/core/utils/colors';
import withAuth from '@/core/utils/protectedRoute';

const MonitorReport = () => {
  const dispatch = useDispatch();

  const activeSelectedDeviceCollocationReportData = useSelector(
    (state) => state.collocationData.activeSelectedDeviceCollocationReportData,
  );
  const activeSelectedDeviceReport = useSelector(
    (state) => state.collocationData.activeSelectedDeviceReport,
  );

  const router = useRouter();
  const { device, batchId } = router.query;

  const [input, setInput] = useState(null);
  const [dataCompletenessRecords, setDataCompletenessRecords] = useState(null);

  const [skipCollocationResults, setSkipCollocationResults] = useState(true);
  const [skipDataCompleteness, setSkipDataCompleteness] = useState(true);
  const [skipInterSensorCorrelation, setSkipInterSensorCorrelation] = useState(true);

  const {
    data: collocationResultsData,
    isError: isFetchCollocationResultsError,
    isSuccess: isFetchCollocationResultsSuccess,
    isLoading: isFetchCollocationResultsLoading,
  } = useGetCollocationResultsQuery(input, { skip: skipCollocationResults });
  const {
    data: dataCompletenessResultsData,
    isError: isFetchDataCompletenessError,
    isSuccess: isFetchDataCompletenessSuccess,
    isLoading: isFetchDataCompletenessLoading,
  } = useGetDataCompletenessResultsQuery(input, { skip: skipDataCompleteness });
  const {
    data: interSensorCorrelationData,
    isLoading: isInterSensorCorrelationDataLoading,
    isSuccess: isInterSensorCorrelationDataSuccess,
    isError: isFetchInterSensorCorrelationDataError,
  } = useGetInterSensorCorrelationQuery(input, { skip: skipInterSensorCorrelation });

  const collocationResults = collocationResultsData ? collocationResultsData.data : null;
  const dataCompletenessResults = dataCompletenessResultsData
    ? dataCompletenessResultsData.data
    : null;
  const interSensorCorrelationList = interSensorCorrelationData
    ? interSensorCorrelationData.data
    : null;

  const {
    data: data,
    isLoading: isSummaryLoading,
    isSuccess: isSummarySuccess,
    isError: isSummaryError,
    error: summaryError,
    refetch,
  } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummary = data ? data.data : [];

  let batchDevices = deviceStatusSummary.filter((device) => device.batch_id === batchId);
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
      devices: [device],
      batchId,
    });
    setSkipDataCompleteness(false);
    setSkipCollocationResults(false);
    setSkipInterSensorCorrelation(false);
  }, [device, batchId]);

  useEffect(() => {
    if (!isEmpty(dataCompletenessResults)) {
      const transformedStatistics = Object.entries(dataCompletenessResults).map(
        ([deviceName, deviceData]) => ({
          deviceName,
          expected_number_of_records: deviceData.expected_number_of_records,
          completeness: deviceData.completeness,
          missing: deviceData.missing,
          actual_number_of_records: deviceData.actual_number_of_records,
          start_date: deviceData.start_date,
          end_date: deviceData.end_date,
        }),
      );
      setDataCompletenessRecords(transformedStatistics);
    }
  }, [dataCompletenessResults]);

  const [correlationDevices, setCorrelationDevices] = useState([device]);
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
      <NavigationBreadCrumb navTitle={'Monitor Report'} />
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
          collocationResults={collocationResults}
          intraCorrelationConcentration={intraCorrelationConcentration}
          toggleIntraCorrelationConcentrationChange={toggleIntraCorrelationConcentrationChange}
          isLoading={isFetchCollocationResultsLoading}
          deviceList={batchDevices}
          graphColors={graphColors}
        />

        {/* <InterCorrelationChart
          collocationResults={interSensorCorrelationList}
          interCorrelationConcentration={interCorrelationConcentration}
          toggleInterCorrelationConcentrationChange={toggleInterCorrelationConcentrationChange}
          correlationDevices={correlationDevices}
          deviceList={batchDevices}
          isLoading={isFetchCollocationResultsLoading}
        /> */}
      </div>

      {(isFetchCollocationResultsLoading || isFetchCollocationResultsSuccess) && (
        <DataCompletenessTable
          dataCompletenessResults={dataCompletenessRecords}
          isLoading={isFetchDataCompletenessLoading}
        />
      )}
    </Layout>
  );
};

export default MonitorReport;
