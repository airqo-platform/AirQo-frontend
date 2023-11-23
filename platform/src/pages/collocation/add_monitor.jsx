import Button from '@/components/Button';
import ContentBox from '@/components/Layout/content_box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { getCollocationDevices } from '@/lib/store/services/deviceRegistry';
import Table from '@/components/Collocation/AddMonitor/Table';
import SkeletonFrame from '@/components/Collocation/AddMonitor/Skeletion';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@/icons/check_circle';
import ScheduleCalendar from '@/components/Collocation/AddMonitor/Calendar';
import { removeDevices } from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
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

  const { collocationDevices: data, status, error } = useSelector((state) => state.deviceRegistry);

  let collocationDevices = data ? data.devices : [];

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
    if (startDate && endDate && selectedCollocateDevices) {
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
      }
    }
    setCollocating(false);
    dispatch(removeDevices(selectedCollocateDevices));
  };

  return (
    <Layout pageTitle={'Add monitor | Collocation'}>
      {(error || (schedulingResponse && schedulingResponse.rejected)) && (
        <Toast
          type={'error'}
          message={
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
              {schedulingResponse && schedulingResponse.fulfilled && (
                <Button className={'mr-1'}>
                  <div className='mr-1'>
                    <CheckCircleIcon />
                  </div>{' '}
                  Saved
                </Button>
              )}
              <Button
                className={`rounded-none text-white bg-blue-900 border border-blue-900 font-medium ${
                  selectedCollocateDevices.length > 0 &&
                  endDate &&
                  startDate &&
                  scheduledBatchName &&
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
