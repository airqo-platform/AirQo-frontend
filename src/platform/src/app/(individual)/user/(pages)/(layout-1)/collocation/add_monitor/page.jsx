'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { withPermission } from '@/core/HOC';
import { getCollocationDevices } from '@/lib/store/services/deviceRegistry';
import { collocateDevices } from '@/lib/store/services/collocation';
import {
  removeDevices,
  resetBatchData,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';

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
    errorMessage: registryError,
  } = useSelector((state) => state.deviceRegistry);

  // collocation state
  const { status: collocationStatus, errorMessage: collocationError } =
    useSelector((state) => state.collocation);

  // selected devices state
  const {
    devices: selectedDevices,
    batchData: { base_device, batch_name, expected_end_time },
  } = useSelector((state) => state.selectedCollocateDevices);

  // breadcrumb data
  const breadcrumbData = [
    {
      name: 'Collocation',
      url: '/collocation',
    },
    {
      name: 'Add Monitor',
      url: '/collocation/add_monitor',
    },
  ];

  useEffect(() => {
    if (collocationDevices.length === 0) {
      dispatch(getCollocationDevices());
    }
  }, [dispatch, collocationDevices.length]);

  useEffect(() => {
    if (collocationStatus === 'success') {
      setIsCollocating(false);
      dispatch(resetBatchData());
      router.push('/collocation/collocate_success');
    }
    if (collocationStatus === 'failed') {
      setIsCollocating(false);
    }
  }, [collocationStatus, dispatch, router]);

  const handleCollocateDevices = async () => {
    if (
      !base_device ||
      selectedDevices.length === 0 ||
      !batch_name ||
      !expected_end_time
    ) {
      return;
    }

    setIsCollocating(true);
    dispatch(
      collocateDevices({
        base_device,
        devices: selectedDevices.map((device) => device.device_id),
        batch_name,
        expected_end_time,
      }),
    );
  };

  const handleRemoveDevices = () => {
    dispatch(removeDevices());
  };

  return (
    <div className="flex flex-col gap-6">
      <NavigationBreadCrumb breadcrumbData={breadcrumbData} />

      {registryStatus === 'loading' ? (
        <SkeletonFrame />
      ) : (
        <>
          <Card>
            <Table devices={collocationDevices} />
          </Card>

          <Card>
            <ScheduleCalendar />
          </Card>

          <div className="flex justify-between items-center">
            <Button
              variant="outlined"
              className="border-gray-300 text-gray-700"
              onClick={handleRemoveDevices}
              disabled={selectedDevices.length === 0}
            >
              Remove selected devices
            </Button>{' '}
            <Button
              className="bg-[var(--org-primary,var(--color-primary,#145fff))] hover:bg-[var(--org-primary-700,var(--color-primary,#145fff))] text-white"
              onClick={handleCollocateDevices}
              disabled={
                !base_device ||
                selectedDevices.length === 0 ||
                !batch_name ||
                !expected_end_time ||
                isCollocating
              }
            >
              {isCollocating ? 'Processing...' : 'Collocate devices'}
            </Button>
          </div>
        </>
      )}

      {registryError && (
        <Toast type="error" timeout={5000} message={registryError} />
      )}

      {collocationError && (
        <Toast type="error" timeout={5000} message={collocationError} />
      )}
    </div>
  );
};

export default withPermission(AddMonitor, [
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
]);
