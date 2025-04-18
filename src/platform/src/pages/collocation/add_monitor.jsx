// src/pages/collocation/add_monitor.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import withAuth, { withPermission } from '@/core/utils/protectedRoute';
import { getCollocationDevices } from '@/lib/store/services/deviceRegistry';
import { collocateDevices } from '@/lib/store/services/collocation';
import {
  removeDevices,
  resetBatchData,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';

import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import Card from '@/components/CardWrapper';
import Button from '@/components/Button';
import Table from '@/components/Collocation/AddMonitor/Table';
import ScheduleCalendar from '@/components/Collocation/AddMonitor/Calendar';
import SkeletonFrame from '@/components/Collocation/AddMonitor/Skeletion';
import Toast from '@/components/Toast';

const AddMonitor = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isCollocating, setIsCollocating] = useState(false);

  // device registry state
  const {
    collocationDevices,
    status: registryStatus,
    error: registryError,
  } = useSelector((state) => state.deviceRegistry);

  // scheduling response state
  const schedulingResponse = useSelector(
    (state) => state.collocation.collocateDevices,
  );

  // selected devices + params
  const {
    selectedCollocateDevices,
    startDate,
    endDate,
    scheduledBatchName,
    scheduledBatchDifferencesThreshold,
    scheduledBatchDataCompletenessThreshold,
    scheduledBatchInterCorrelationThreshold,
    scheduledBatchIntraCorrelationThreshold,
  } = useSelector((state) => state.selectedCollocateDevices);

  // fetch available devices on mount
  useEffect(() => {
    dispatch(getCollocationDevices());
  }, [dispatch]);

  const handleCollocation = async () => {
    setIsCollocating(true);

    // build body only if all required params are present
    const body = {
      startDate,
      endDate,
      devices: selectedCollocateDevices,
      batchName: scheduledBatchName,
      differencesThreshold: scheduledBatchDifferencesThreshold,
      dataCompletenessThreshold: scheduledBatchDataCompletenessThreshold,
      interCorrelationThreshold: scheduledBatchInterCorrelationThreshold,
      intraCorrelationThreshold: scheduledBatchIntraCorrelationThreshold,
    };

    await dispatch(collocateDevices(body));

    if (schedulingResponse.fulfilled) {
      router.push('/collocation/collocate_success');
      dispatch(removeDevices(selectedCollocateDevices));
      dispatch(resetBatchData());
    }

    setIsCollocating(false);
  };

  // only enable “Start collocation” when everything is valid
  const canStart =
    selectedCollocateDevices.length > 0 &&
    startDate &&
    endDate &&
    scheduledBatchName &&
    scheduledBatchDifferencesThreshold >= 0 &&
    scheduledBatchDifferencesThreshold <= 5 &&
    scheduledBatchDataCompletenessThreshold >= 0 &&
    scheduledBatchDataCompletenessThreshold <= 100 &&
    scheduledBatchInterCorrelationThreshold >= 0 &&
    scheduledBatchInterCorrelationThreshold <= 1 &&
    scheduledBatchIntraCorrelationThreshold >= 0 &&
    scheduledBatchIntraCorrelationThreshold <= 1 &&
    !isCollocating;

  const isLoading = registryStatus === 'loading';
  const isError = registryStatus === 'failed';

  return (
    <Layout
      pageTitle="Add monitor | Collocation"
      topbarTitle="Collocation"
      noBorderBottom
    >
      {isError && (
        <Toast
          type="error"
          message={
            registryError ||
            schedulingResponse.error ||
            'Uh‑oh! Unable to fetch devices. Please try again later.'
          }
        />
      )}

      <div>
        {isLoading ? (
          <SkeletonFrame />
        ) : (
          <>
            <NavigationBreadCrumb navTitle="Add monitor">
              <div className="flex">
                <Button
                  onClick={handleCollocation}
                  disabled={!canStart}
                  className={`rounded-none bg-blue-900 border-blue-900 font-medium text-white ${
                    canStart
                      ? 'cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  dataTestId="collocation-schedule-button"
                >
                  Start collocation
                </Button>
              </div>
            </NavigationBreadCrumb>

            <Card className="m-0 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Table collocationDevices={collocationDevices} />
                <ScheduleCalendar />
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default withPermission(
  withAuth(AddMonitor),
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
);
