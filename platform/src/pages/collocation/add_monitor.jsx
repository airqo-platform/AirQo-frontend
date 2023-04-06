import Button from '@/components/Button';
import Layout from '@/components/Layout';
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
  const {
    data: data,
    isLoading,
    isSuccess,
    isError,
    // error,
  } = useGetCollocationDevicesQuery();

  let collocationDevices = data ? data.devices : [];
  const [collocateDevices, { error }] = useCollocateDevicesMutation();

  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  const startDate = useSelector((state) => state.selectedCollocateDevices.startDate);
  const endDate = useSelector((state) => state.selectedCollocateDevices.endDate);

  const [collocateDeviceError, setCollocateDeviceError] = useState(false);
  const [isCollocating, setCollocating] = useState(false);

  const handleCollocation = async () => {
    setCollocating(true);
    if (startDate && endDate && selectedCollocateDevices) {
      const body = {
        startDate,
        endDate,
        devices: selectedCollocateDevices,
        expectedRecordsPerDay: 24,
        completenessThreshold: 0.5,
        correlationThreshold: 0.4,
        verbose: true,
      };

      const response = await collocateDevices(body);

      if (response.error && response.error.data.errors[0]) {
        setCollocateDeviceError(true);
      } else {
        router.push('/collocation/collocate_success');
      }
    }
    setCollocating(false);
    dispatch(removeDevices(selectedCollocateDevices));
    setTimeout(() => {
      setCollocateDeviceError(false);
    }, 5000);
  };

  return (
    <Layout>
      {(isError || !isSuccess) && (
        <Toast
          type={'error'}
          timeout={20000}
          message="We're sorry, but our server is currently unavailable. We are working to resolve the issue and apologize for the inconvenience."
          dataTestId={'collocation-error-toast'}
        />
      )}
      {collocateDeviceError && (
        <Toast type={'error'} message={'Uh-oh! Devices have no data for that time period.'} />
      )}
      {/* SKELETON LOADER */}
      {isLoading ? (
        <SkeletonFrame />
      ) : (
        <>
          <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Add monitor'}>
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
                  selectedCollocateDevices.length > 0 && endDate && startDate && !isCollocating
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
