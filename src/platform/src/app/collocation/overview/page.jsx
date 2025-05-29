'use client';

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
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: deviceStatusSummary,
    loading: summaryLoading,
    rejected: summaryError,
  } = useSelector((state) => state.collocation.collocationBatchSummary);

  const {
    data: statistics,
    loading: statisticsLoading,
    rejected: statisticsError,
  } = useSelector((state) => state.collocation.collocationStatistics);

  const { overviewBatches } = useSelector((state) => state.collocationData);

  useEffect(() => {
    dispatch(getDeviceStatusSummary());
    dispatch(getCollocationStatistics());
  }, [dispatch]);

  useEffect(() => {
    if (statistics && statistics.length > 0) {
      setDeviceStatistics(statistics);
    }
  }, [statistics]);

  useEffect(() => {
    if (deviceStatusSummary && deviceStatusSummary.length > 0) {
      const allDevices = findAllMatchingDevices(deviceStatusSummary);
      setAllmatchingDevices(allDevices);
    }
    setIsLoading(summaryLoading || statisticsLoading);
  }, [deviceStatusSummary, summaryLoading, statisticsLoading]);

  const handleAddBatch = (batch) => {
    dispatch(addOverviewBatch(batch));
  };

  const handleRemoveBatch = (batchId) => {
    dispatch(removeOverviewBatch(batchId));
  };

  const breadcrumbData = [
    {
      name: 'Collocation',
      url: '/collocation',
    },
    {
      name: 'Overview',
      url: '/collocation/overview',
    },
  ];

  const hasData = deviceStatusSummary && deviceStatusSummary.length > 0;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <HeaderNav
          title="Collocation Overview"
          subTitle="Monitor and analyze device collocation performance"
          breadcrumbData={breadcrumbData}
        />

        {isLoading ? (
          <OverviewSkeleton />
        ) : hasData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Device Performance
                  </h2>
                  <Button
                    variant="outlined"
                    className="border-gray-300 text-gray-700"
                  >
                    Export Data
                  </Button>
                </div>

                {overviewBatches.length > 0 ? (
                  <GraphCard
                    devices={allmatchingDevices}
                    statistics={deviceStatistics}
                    selectedBatches={overviewBatches}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select batches to view performance data
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Active Batches
                  </h2>
                </div>

                <div className="space-y-3">
                  {deviceStatusSummary
                    .filter((batch) => batch.status === 'active')
                    .map((batch) => (
                      <div
                        key={batch.batch_id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {batch.batch_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Started:{' '}
                              {format(
                                new Date(batch.start_date),
                                'MMM dd, yyyy',
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Devices: {batch.device_count}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {overviewBatches.some(
                              (b) => b.batch_id === batch.batch_id,
                            ) ? (
                              <Button
                                variant="outlined"
                                size="sm"
                                className="border-red-300 text-red-700"
                                onClick={() =>
                                  handleRemoveBatch(batch.batch_id)
                                }
                              >
                                Remove
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleAddBatch(batch)}
                              >
                                Add to View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </div>

              <div className="space-y-4">
                {deviceStatusSummary.slice(0, 5).map((batch) => (
                  <div
                    key={batch.batch_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {batch.batch_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {batch.status === 'active'
                          ? 'Currently active'
                          : 'Ended'}{' '}
                        • {moment(batch.start_date).fromNow()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <EmptyState />
        )}

        {(summaryError || statisticsError) && (
          <Toast
            type="error"
            timeout={5000}
            message="Failed to load collocation data"
          />
        )}
      </div>
    </Layout>
  );
};

export default withAuth(
  withPermission(CollocationOverview, [
    'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
  ]),
);
