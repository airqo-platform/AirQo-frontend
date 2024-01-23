import Button from '@/components/Button';
import ContentBox from '@/components/Layout/content_box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { getCollocationDevices } from '@/lib/store/services/deviceRegistry';
import Table from '@/components/Collocation/AddMonitor/Table';
import SkeletonFrame from '@/components/Collocation/AddMonitor/Skeletion';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@/icons/check_circle';
import ScheduleCalendar from '@/components/Collocation/AddMonitor/Calendar';
import {
  removeDevices,
  resetBatchData,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
import Toast from '@/components/Toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import withAuth, { withPermission } from '@/core/utils/protectedRoute';
import { collocateDevices } from '@/lib/store/services/collocation';

const AddMonitor = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isCollocating, setCollocating] = useState(false);

  const schedulingResponse = useSelector((state) => state.collocation.collocateDevices);

  const { collocationDevices, status, error } = useSelector((state) => state.deviceRegistry);

  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  const startDate = useSelector((state) => state.selectedCollocateDevices.startDate);
  const endDate = useSelector((state) => state.selectedCollocateDevices.endDate);
  const scheduledBatchName = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchName,
  );
  const scheduledBatchDataCompletenessThreshold = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchDataCompletenessThreshold,
  );
  const scheduledBatchInterCorrelationThreshold = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchInterCorrelationThreshold,
  );
  const scheduledBatchIntraCorrelationThreshold = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchIntraCorrelationThreshold,
  );
  const scheduledBatchDifferencesThreshold = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchDifferencesThreshold,
  );

  useEffect(() => {
    dispatch(getCollocationDevices());
  }, []);

  const handleCollocation = async () => {
    setCollocating(true);
    if (
      selectedCollocateDevices &&
      startDate &&
      endDate &&
      scheduledBatchDifferencesThreshold >= 0 &&
      scheduledBatchDifferencesThreshold <= 5 &&
      scheduledBatchDataCompletenessThreshold >= 0 &&
      scheduledBatchDataCompletenessThreshold <= 100 &&
      scheduledBatchInterCorrelationThreshold >= 0 &&
      scheduledBatchInterCorrelationThreshold <= 1 &&
      scheduledBatchIntraCorrelationThreshold >= 0 &&
      scheduledBatchIntraCorrelationThreshold <= 1
    ) {
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

        setCollocating(false);
        dispatch(removeDevices(selectedCollocateDevices));
        dispatch(resetBatchData());
      }
    }
  };

  return (
    <Layout pageTitle={'Add monitor | Collocation'}>
      {status && status === 'failed' && (
        <Toast
          type={'error'}
          message={
            error ||
            schedulingResponse.error ||
            'Uh-oh! Unable to collocate devices. Please check your connection or try again later.'
          }
          dataTestId={'collocation-error-toast'}
        />
      )}
      {/* SKELETON LOADER */}
      {status && status === 'loading' ? (
        <SkeletonFrame />
      ) : (
        <>
          <NavigationBreadCrumb navTitle={'Add monitor'}>
            <div className='flex'>
              <Button
                className={`rounded-none text-white bg-blue-900 border border-blue-900 font-medium ${
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
                  !isCollocating
                    ? 'cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                onClick={handleCollocation}
                dataTestId={'collocation-schedule-button'}
              >
                Start collocation
              </Button>
            </div>
          </NavigationBreadCrumb>
          <ContentBox>
            <div className='grid grid-cols-1 md:grid-cols-3'>
              {/* DEVICE TABLE */}
              <Table collocationDevices={collocationDevices} />
              {/* CALENDAR */}
              <ScheduleCalendar />
            </div>
          </ContentBox>
        </>
      )}
    </Layout>
  );
};

export default withPermission(withAuth(AddMonitor), 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
