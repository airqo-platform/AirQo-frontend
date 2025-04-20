import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import moment from 'moment';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';

import withAuth, { withPermission } from '@/core/utils/protectedRoute';
import { findAllMatchingDevices } from '@/core/utils/matchingDevices';
import {
  addOverviewBatch,
  removeOverviewBatch,
} from '@/lib/store/services/collocation/collocationDataSlice';
import {
  getCollocationStatistics,
  getDeviceStatusSummary,
} from '@/lib/store/services/collocation';

import Layout from '@/components/Layout';
import HeaderNav from '@/components/Layout/header';
import Card from '@/components/CardWrapper';
import GraphCard from '@/components/Collocation/AddMonitor/Overview/graph_card';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import EmptyState from '@/components/Collocation/Overview/empty_state';
import OverviewSkeleton from '@/components/Collocation/AddMonitor/Skeletion/Overview';

const CollocationOverview = () => {
  const dispatch = useDispatch();

  const [deviceStatistics, setDeviceStatistics] = useState(null);
  const [allmatchingDevices, setAllmatchingDevices] = useState([]);
  const [collocationPeriods, setCollocationPeriods] = useState([]);
  const [activeCollocationPeriod, setActiveCollocationPeriod] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [device1, setDevice1] = useState(null);
  const [device2, setDevice2] = useState(null);
  const [statisticsParams, setStatisticsParams] = useState({});

  const selectedBatch = useSelector(
    (state) => state.collocationData.overviewBatch,
  );

  const {
    data: deviceStatusSummary,
    loading: deviceSummaryLoading,
    fulfilled: deviceSummarySuccess,
    rejected: deviceSummaryError,
  } = useSelector((state) => state.collocation.collocationBatchSummary);

  const {
    data: collocationStatistics,
    loading: collocationStatisticsLoading,
    fulfilled: collocationStatisticsSuccess,
    rejected: collocationStatisticsError,
  } = useSelector((state) => state.collocation.collocationStatisticsData);

  // Fetch summaries on mount
  useEffect(() => {
    dispatch(getDeviceStatusSummary());
  }, [dispatch]);

  // Dispatch stats when params change
  useEffect(() => {
    if (!isEmpty(statisticsParams)) {
      dispatch(getCollocationStatistics(statisticsParams));
    }
  }, [dispatch, statisticsParams]);

  // Build matching devices & periods
  useEffect(() => {
    if (deviceStatusSummary?.length) {
      const { matchingDevicePairs, uniqueDatePairs } =
        findAllMatchingDevices(deviceStatusSummary);

      setAllmatchingDevices(matchingDevicePairs);
      setCollocationPeriods(uniqueDatePairs);
      setActiveCollocationPeriod(uniqueDatePairs[0]);
      setActiveIndex(0);

      const firstPair = matchingDevicePairs[0] || [];
      dispatch(
        addOverviewBatch(
          firstPair.length > 1 ? [firstPair[0], firstPair[1]] : firstPair,
        ),
      );
    }
  }, [dispatch, deviceStatusSummary]);

  // Update devices when batch selection changes
  useEffect(() => {
    if (!isEmpty(selectedBatch)) {
      setDevice1(selectedBatch[0].device_name);
      setDevice2(selectedBatch[1]?.device_name || null);
    }
  }, [selectedBatch]);

  // Prepare stats params when selection changes
  useEffect(() => {
    if (!isEmpty(selectedBatch)) {
      const devices = selectedBatch.map((d) => d.device_name);
      setStatisticsParams({ devices, batchId: selectedBatch[0].batch_id });
    }
  }, [selectedBatch]);

  // Transform incoming stats for display
  useEffect(() => {
    if (collocationStatistics?.data) {
      const entries = Object.entries(collocationStatistics.data).map(
        ([deviceName, data]) => ({
          deviceName,
          s1_pm10_mean: data.s1_pm10_mean,
          s1_pm2_5_mean: data.s1_pm2_5_mean,
          s2_pm10_mean: data.s2_pm10_mean,
          s2_pm2_5_mean: data.s2_pm2_5_mean,
        }),
      );
      setDeviceStatistics(entries);
    }
  }, [collocationStatistics]);

  const isLoading = deviceSummaryLoading || collocationStatisticsLoading;
  const hasError = deviceSummaryError || collocationStatisticsError;

  return (
    <Layout
      topbarTitle="Collocation"
      pageTitle="Collocation | Overview"
      noBorderBottom
    >
      <HeaderNav category="Collocation" component="Overview" />

      {hasError && (
        <Toast type="error" timeout={10000} message="Server error!" />
      )}

      <div>
        {isLoading ? (
          <OverviewSkeleton />
        ) : collocationStatisticsSuccess || selectedBatch ? (
          <Card className="m-0">
            <div className="grid grid-cols-1 divide-y divide-grey-150 px-6">
              {/* Header */}
              <div className="py-6 flex flex-col md:flex-row justify-between">
                <div>
                  <h5 className="font-semibold text-lg">Today</h5>
                  <p className="text-base font-normal opacity-40">
                    {format(new Date(), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="md:flex md:items-center mt-4 md:mt-0">
                  <span className="text-sm opacity-70 mr-2">
                    Select a collocation period
                  </span>
                  <div className="relative">
                    <Button
                      className="w-auto h-10 bg-blue-200 rounded-lg font-semibold text-purple-700"
                      onClick={() => setIsOpen((o) => !o)}
                    >
                      {!isEmpty(activeCollocationPeriod) &&
                        `${moment(activeCollocationPeriod.start_date).format(
                          'MMM DD, yyyy',
                        )} – ${moment(activeCollocationPeriod.end_date).format(
                          'MMM DD, yyyy',
                        )}`}
                    </Button>
                    {isOpen && (
                      <ul className="absolute z-30 mt-1 ml-2 max-h-60 w-auto overflow-y-auto rounded-md border bg-white p-2 shadow">
                        {collocationPeriods.map((period, i) => (
                          <li
                            key={i}
                            className="cursor-pointer rounded p-2 text-sm hover:bg-gray-200"
                            onClick={() => {
                              dispatch(removeOverviewBatch());
                              const pair = allmatchingDevices[i] || [];
                              dispatch(addOverviewBatch(pair));
                              setActiveCollocationPeriod(period);
                              setActiveIndex(i);
                              setIsOpen(false);
                            }}
                          >
                            {`${moment(period.start_date).format('MMM DD')} – ${moment(
                              period.end_date,
                            ).format('MMM DD')}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Graphs */}
              <div
                className={`grid grid-cols-1 ${
                  selectedBatch.length === 2 ? 'lg:grid-cols-2' : ''
                } lg:divide-x divide-grey-150`}
              >
                {!isEmpty(selectedBatch) && !isEmpty(deviceStatistics) ? (
                  selectedBatch.map((device, idx) => (
                    <GraphCard
                      key={device.device_name}
                      data={[deviceStatistics[idx]]}
                      batch={allmatchingDevices[activeIndex]}
                      device={device}
                      secondGraph={idx > 0}
                      selectedBatch={selectedBatch}
                    />
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center p-8">
                    <p className="opacity-40">
                      No data available for the current devices. Compare other
                      devices or collocation periods.
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Table */}
              <div className="divide-y pt-20">
                <div className="flex justify-between p-6 md:px-12">
                  <span className="opacity-60">Monitor name</span>
                  <span className="opacity-60">End date</span>
                </div>
                {[device1, device2].map(
                  (name) =>
                    name && (
                      <div
                        key={name}
                        className="flex justify-between p-6 md:px-12"
                      >
                        <span className="uppercase font-semibold">{name}</span>
                        <span className="text-xl">
                          {moment(activeCollocationPeriod.end_date).format(
                            'MMM DD, yyyy',
                          )}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState />
        )}
      </div>
    </Layout>
  );
};

export default withPermission(
  withAuth(CollocationOverview),
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
);
