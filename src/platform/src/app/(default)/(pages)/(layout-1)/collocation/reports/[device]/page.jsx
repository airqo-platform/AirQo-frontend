'use client';

import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import Box from '@/components/Collocation/Report/box';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import CustomTable from '@/components/Table';
import { isEmpty } from 'underscore';
import ContentBox from '@/components/Layout/content_box';
import CustomLegend from '@/components/Collocation/Report/MonitorReport/IntraCorrelation/custom_legend';
// Remove unused import since middleware handles auth
import { useDispatch, useSelector } from 'react-redux';
import {
  getCollocationStatistics,
  getCollocationResults,
} from '@/lib/store/services/collocation';
import { withPermission } from '@/core/utils/nextAuthProtectedRoute';

const Reports = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const searchParams = useSearchParams();
  const device = params.device;
  const batchId = searchParams.get('batchId');

  const [deviceStatisticsInput, setDeviceStatisticsInput] = useState(null);
  const [input, setInput] = useState(null);
  const [deviceStatistics, setDeviceStatistics] = useState([]);
  const [pmConcentration, setPmConcentration] = useState('2.5');
  const [batchList, setBatchList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    data: statistics,
    loading: statisticsLoading,
    rejected: statisticsError,
  } = useSelector((state) => state.collocation.collocationStatistics);

  const {
    data: results,
    loading: resultsLoading,
    rejected: resultsError,
  } = useSelector((state) => state.collocation.collocationResults);

  const breadcrumbData = [
    {
      name: 'Collocation',
      url: '/collocation',
    },
    {
      name: 'Reports',
      url: '/collocation/reports',
    },
    {
      name: device || 'Device Report',
      url: `/collocation/reports/${device}`,
    },
  ];

  useEffect(() => {
    if (device) {
      dispatch(getCollocationStatistics());
      if (batchId) {
        dispatch(getCollocationResults({ device, batchId }));
      }
    }
  }, [dispatch, device, batchId]);

  useEffect(() => {
    if (statistics && statistics.length > 0) {
      const deviceStats = statistics.filter((stat) => stat.device === device);
      setDeviceStatistics(deviceStats);

      // Extract unique batch list
      const batches = [...new Set(deviceStats.map((stat) => stat.batch_id))];
      setBatchList(batches);
    }
    setIsLoading(statisticsLoading || resultsLoading);
  }, [statistics, statisticsLoading, resultsLoading, device]);

  useEffect(() => {
    if (statisticsError || resultsError) {
      setError('Failed to load collocation data');
    }
  }, [statisticsError, resultsError]);

  const handlePollutantChange = (concentration) => {
    setPmConcentration(concentration);
  };

  const filteredStatistics = deviceStatistics.filter(
    (stat) => stat.pollutant === `pm${pmConcentration}`,
  );

  return (
    <div className="flex flex-col gap-6">
      <NavigationBreadCrumb breadcrumbData={breadcrumbData} />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner width={40} height={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Box
              title="Intra Sensor Correlation"
              subtitle="Comparison of data between sensors within the same device."
            />
            <Box
              title="Inter Sensor Correlation"
              subtitle="Comparison of data between sensors across different devices."
            />
          </div>

          <ContentBox>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Device Report: {device}
              </h2>
              <PollutantDropdown
                selectedPollutant={pmConcentration}
                onPollutantChange={handlePollutantChange}
              />
            </div>

            {!isEmpty(filteredStatistics) ? (
              <>
                <div className="mb-8">
                  <CorrelationChart
                    data={filteredStatistics}
                    pollutant={`pm${pmConcentration}`}
                  />
                </div>

                <div className="mb-6">
                  <CustomLegend data={filteredStatistics} />
                </div>

                <CustomTable
                  data={filteredStatistics}
                  columns={[
                    { key: 'batch_id', label: 'Batch ID' },
                    { key: 'correlation_coefficient', label: 'Correlation' },
                    { key: 'r_squared', label: 'R²' },
                    { key: 'rmse', label: 'RMSE' },
                    { key: 'mean_bias', label: 'Mean Bias' },
                  ]}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No correlation data available for PM{pmConcentration}</p>
                <p className="text-sm mt-2">
                  Try selecting a different pollutant or check if data exists
                  for this device.
                </p>
              </div>
            )}
          </ContentBox>
        </>
      )}

      {error && (
        <Toast
          type="error"
          timeout={5000}
          message={error}
          clearData={() => setError(null)}
        />
      )}
    </div>
  );
};

export default withPermission(Reports, [
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
]);
