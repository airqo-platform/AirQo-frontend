'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withPermission } from '@/core/HOC/withNextAuth';
import { getDeviceStatusSummary } from '@/lib/store/services/collocation';

import HeaderNav from '@/components/Layout/header';
import Card from '@/components/CardWrapper';
import Button from '@/components/Button';
import Tabs from '@/components/Tabs';
import Table from '@/components/Collocation/DeviceStatus/Table';
import Toast from '@/components/Toast';
import EmptyState from '@/components/Collocation/Collocate/empty_state';

import UploadIcon from '@/icons/Actions/upload.svg';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';

const Collocate = () => {
  const dispatch = useDispatch();

  const {
    data: deviceStatusSummary,
    loading: isLoading,
    rejected: isError,
  } = useSelector((state) => state.collocation.collocationBatchSummary);

  // fetch on mount
  useEffect(() => {
    dispatch(getDeviceStatusSummary());
  }, [dispatch]);

  const tabs = [
    {
      label: 'Active',
      key: 'active',
      content: (
        <div className="mt-4">
          <Table
            data={deviceStatusSummary.filter(
              (batch) => batch.status === 'active',
            )}
            isLoading={isLoading}
          />
        </div>
      ),
    },
    {
      label: 'Ended',
      key: 'ended',
      content: (
        <div className="mt-4">
          <Table
            data={deviceStatusSummary.filter(
              (batch) => batch.status === 'ended',
            )}
            isLoading={isLoading}
          />
        </div>
      ),
    },
  ];

  const hasData = deviceStatusSummary && deviceStatusSummary.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <HeaderNav
        title="Collocation"
        subTitle="Manage your device collocations"
      />

      {hasData ? (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Device Status Summary
            </h2>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-700"
                Icon={UploadIcon}
              >
                Import
              </Button>
              <Button
                href="/collocation/add_monitor"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                Icon={BoxedAddIcon}
              >
                Add Monitor
              </Button>
            </div>
          </div>

          <Tabs tabs={tabs} defaultActiveTab="active" />
        </Card>
      ) : (
        <EmptyState />
      )}

      {isError && (
        <Toast
          type="error"
          timeout={5000}
          message="Failed to fetch device status summary"
        />
      )}
    </div>
  );
};

export default withPermission(Collocate, [
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
]);
