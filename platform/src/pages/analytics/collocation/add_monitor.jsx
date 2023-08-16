import Button from '@/components/Button';
import ContentBox from '@/components/Layout/content_box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import {
  useGetCollocationDevicesQuery,
  getCollocationDevices,
  getRunningQueriesThunk,
} from '@/lib/store/services/deviceRegistry';
import { wrapper } from '@/lib/store';
import Table from '@/components/Collocation/AddMonitor/Table';
import SkeletonFrame from '@/components/Collocation/AddMonitor/Skeletion';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@/icons/check_circle';
import ScheduleCalendar from '@/components/Collocation/AddMonitor/Calendar';
import { useCollocateDevicesMutation } from '@/lib/store/services/collocation';
import { removeDevices } from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
import Toast from '@/components/Toast';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '@/components/Layout';
import withAuth from '@/core/utils/protectedRoute';
import Head from 'next/head';

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
  const name = context.params?.name;
  if (typeof name === 'string') {
    store.dispatch(getCollocationDevices.initiate(name));
  }

  await Promise.all(store.dispatch(getRunningQueriesThunk()));

  return {
    props: {},
  };
});

const AddMonitor = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isCollocating, setCollocating] = useState(false);

  const {
    data: data,
    isLoading,
    isError: isFetchRunningDevicesError,
  } = useGetCollocationDevicesQuery();

  let collocationDevices = data ? data.devices : [];
  const [collocateDevices, { isError: isCollocateDeviceError }] = useCollocateDevicesMutation();

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

      const response = await collocateDevices(body);

      if (!response.error) {
        router.push('/analytics/collocation/collocate_success');
      }
    }
    setCollocating(false);
    dispatch(removeDevices(selectedCollocateDevices));
  };

  return (
    <Layout>
      <Head>
        <title>Add Monitors | Collocation</title>
        <meta
          property='og:title'
          content='Add Monitors | Collocation'
          key='Add Monitors | Collocation'
        />
      </Head>
      {(isFetchRunningDevicesError || isCollocateDeviceError) && (
        <Toast
          type={'error'}
          message={
            'Uh-oh! Unable to collocate devices. Please check your connection or try again later.'
          }
          dataTestId={'collocation-error-toast'}
        />
      )}
      {/* SKELETON LOADER */}
      {isLoading ? (
        <SkeletonFrame />
      ) : (
        <>
          <NavigationBreadCrumb navTitle={'Add monitor'}>
            <div className='flex'>
              {/* {isCollocating && (
                <Button className={'mr-1'}>
                  <div className='mr-1'>
                    <CheckCircleIcon />
                  </div>{' '}
                  Saved
                </Button>
              )} */}
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

export default AddMonitor;
