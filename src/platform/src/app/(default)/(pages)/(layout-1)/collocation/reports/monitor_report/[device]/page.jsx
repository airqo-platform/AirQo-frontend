'use client';

import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import DataCompletenessTable from '@/components/Collocation/Report/MonitorReport/DataCompletenessTable';
import { useEffect, useState } from 'react';
import InterCorrelationChart from '@/components/Collocation/Report/MonitorReport/InterCorrelation';
import IntraCorrelationChart from '@/components/Collocation/Report/MonitorReport/IntraCorrelation';
import Toast from '@/components/Toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  addActiveSelectedDeviceCollocationReportData,
  addActiveSelectedDeviceReport,
} from '@/lib/store/services/collocation/collocationDataSlice';
import { isEmpty } from 'underscore';
import { withPermission } from '@/core/utils/nextAuthProtectedRoute';
import {
  getCollocationResults,
  getDataCompletenessResults,
  getInterSensorCorrelation,
  getDeviceStatusSummary,
} from '@/lib/store/services/collocation';

const MonitorReport = () => {
  const dispatch = useDispatch();

  const activeSelectedDeviceCollocationReportData = useSelector(
    (state) => state.collocationData.activeSelectedDeviceCollocationReportData,
  );
  const activeSelectedDeviceReport = useSelector(
    (state) => state.collocationData.activeSelectedDeviceReport,
  );

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { device } = params;
  const batchId = searchParams.get('batchId');

  const [input, setInput] = useState(null);
  const [dataCompletenessRecords, setDataCompletenessRecords] = useState(null);

  const {
    data: collocationResultsData,
    loading: isFetchCollocationResultsLoading,
    fulfilled: isFetchCollocationResultsSuccess,
    rejected: isFetchCollocationResultsError,
  } = useSelector((state) => state.collocation.collocationResults);

  const {
    data: dataCompletenessResultsData,
    loading: isFetchDataCompletenessLoading,
    fulfilled: isFetchDataCompletenessSuccess,
    rejected: isFetchDataCompletenessError,
  } = useSelector((state) => state.collocation.dataCompletenessResults);

  const {
    data: interSensorCorrelationResultsData,
    loading: isFetchInterSensorCorrelationLoading,
    fulfilled: isFetchInterSensorCorrelationSuccess,
    rejected: isFetchInterSensorCorrelationError,
  } = useSelector((state) => state.collocation.interSensorCorrelation);

  const {
    data: deviceStatusSummaryData,
    loading: isFetchDeviceStatusSummaryLoading,
    fulfilled: isFetchDeviceStatusSummarySuccess,
    rejected: isFetchDeviceStatusSummaryError,
  } = useSelector((state) => state.collocation.deviceStatusSummary);

  const [errorMessage, setErrorMessage] = useState('');

  const breadcrumbs = [
    {
      title: 'Overview',
      path: '/collocation/overview',
    },
    {
      title: 'Reports',
      path: '/collocation/reports',
    },
    {
      title: device,
      path: '',
    },
  ];

  const handleErrorToast = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  useEffect(() => {
    if (
      device &&
      batchId &&
      isEmpty(activeSelectedDeviceCollocationReportData) &&
      isEmpty(activeSelectedDeviceReport)
    ) {
      dispatch(
        getCollocationResults({
          device_name: device,
          batch_id: batchId,
        }),
      );
      dispatch(
        getDataCompletenessResults({
          device_name: device,
          batch_id: batchId,
        }),
      );
      dispatch(
        getInterSensorCorrelation({
          device_name: device,
          batch_id: batchId,
        }),
      );
      dispatch(
        getDeviceStatusSummary({
          device: device,
          batch_id: batchId,
        }),
      );
    }
  }, [device, batchId, dispatch]);

  useEffect(() => {
    if (collocationResultsData && !isEmpty(collocationResultsData)) {
      dispatch(
        addActiveSelectedDeviceCollocationReportData(collocationResultsData),
      );
    }
  }, [collocationResultsData]);

  useEffect(() => {
    if (isFetchCollocationResultsError) {
      handleErrorToast(
        'An error occurred while fetching collocation results data',
      );
    }
  }, [isFetchCollocationResultsError]);

  useEffect(() => {
    if (isFetchDataCompletenessError) {
      handleErrorToast(
        'An error occurred while fetching data completeness results',
      );
    }
  }, [isFetchDataCompletenessError]);

  useEffect(() => {
    if (isFetchInterSensorCorrelationError) {
      handleErrorToast(
        'An error occurred while fetching inter sensor correlation results',
      );
    }
  }, [isFetchInterSensorCorrelationError]);

  useEffect(() => {
    if (isFetchDeviceStatusSummaryError) {
      handleErrorToast(
        'An error occurred while fetching device status summary',
      );
    }
  }, [isFetchDeviceStatusSummaryError]);

  useEffect(() => {
    if (dataCompletenessResultsData && !isEmpty(dataCompletenessResultsData)) {
      setDataCompletenessRecords(dataCompletenessResultsData);
    }
  }, [dataCompletenessResultsData]);

  useEffect(() => {
    if (deviceStatusSummaryData && !isEmpty(deviceStatusSummaryData)) {
      dispatch(addActiveSelectedDeviceReport(deviceStatusSummaryData));
    }
  }, [deviceStatusSummaryData]);

  useEffect(() => {
    if (
      activeSelectedDeviceCollocationReportData &&
      !isEmpty(activeSelectedDeviceCollocationReportData)
    ) {
      setInput(activeSelectedDeviceCollocationReportData);
    }
  }, [activeSelectedDeviceCollocationReportData]);

  return (
    <div className="px-3 py-3 w-full">
      <NavigationBreadCrumb breadcrumbs={breadcrumbs} />
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-3xl font-bold">Monitor Report</h1>
          <p className="text-lg text-gray-600">Report for device: {device}</p>
        </div>
      </div>

      {errorMessage && (
        <Toast
          type="error"
          timeout={5000}
          message={errorMessage}
          dataTestId="error-toast"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Data Completeness</h2>
          <DataCompletenessTable
            data={dataCompletenessRecords}
            loading={isFetchDataCompletenessLoading}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Inter-Correlation</h2>
          <InterCorrelationChart
            data={interSensorCorrelationResultsData}
            loading={isFetchInterSensorCorrelationLoading}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Intra-Correlation</h2>
          <IntraCorrelationChart
            data={input}
            loading={isFetchCollocationResultsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default withNextAuth(
  withPermission(MonitorReport, 'CREATE_UPDATE_AND_DELETE_NETWORK_SITES'),
);
