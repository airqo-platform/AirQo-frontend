import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withAuth, { withPermission } from '@/core/utils/protectedRoute';
import { getDeviceStatusSummary } from '@/lib/store/services/collocation';

import Layout from '@/components/Layout';
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

  const filterBy = (status) =>
    deviceStatusSummary?.filter((d) => d.status === status) || [];

  return (
    <Layout
      topbarTitle="Collocation"
      pageTitle="Collocate | Collocation"
      noBorderBottom
    >
      <HeaderNav category="Collocation" component="Collocate">
        {isError && (
          <Toast
            type="error"
            timeout={5000}
            message="Uh‑oh! Server error. Please try again later."
          />
        )}

        {(isLoading || !deviceStatusSummary) && (
          <div className="flex gap-4">
            <Button disabled>
              <UploadIcon className="mr-2" />
              Import data
            </Button>
            <Button path="/collocation/add_monitor">
              <BoxedAddIcon className="mr-2" />
              Add monitors
            </Button>
          </div>
        )}
      </HeaderNav>

      <div>
        <Card className="m-0">
          {deviceStatusSummary ? (
            <div className="w-full">
              <Tabs>
                <div label="All">
                  <Table
                    collocationDevices={deviceStatusSummary}
                    isLoading={isLoading}
                  />
                </div>
                <div label="Passed">
                  <Table
                    collocationDevices={filterBy('PASSED')}
                    isLoading={isLoading}
                  />
                </div>
                <div label="Failed">
                  <Table
                    collocationDevices={filterBy('FAILED')}
                    isLoading={isLoading}
                  />
                </div>
                <div label="Running">
                  <Table
                    collocationDevices={filterBy('RUNNING')}
                    isLoading={isLoading}
                  />
                </div>
                <div label="Scheduled">
                  <Table
                    collocationDevices={filterBy('SCHEDULED')}
                    isLoading={isLoading}
                  />
                </div>
              </Tabs>
            </div>
          ) : (
            <EmptyState />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default withPermission(
  withAuth(Collocate),
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
);
