import Button from '../../common/components/Button';
import Layout from '../../common/components/Layout';
import ContentBox from '../../common/components/Layout/content_box';
import NavigationBreadCrumb from '../../common/components/Navigation/breadcrumb';
import {
  useGetCollocationDevicesQuery,
  getCollocationDevices,
  getRunningQueriesThunk,
} from '@/lib/store/services/deviceRegistry';
import { wrapper } from '@/lib/store';
import Table from '../../common/components/AddMonitor/Table';
import SkeletonFrame from '../../common/components/AddMonitor/Skeletion';
import { useSelector } from 'react-redux';
import CheckCircleIcon from '@/icons/check_circle';
import ScheduleCalendar from '../../common/components/AddMonitor/Calendar';
import { useCollocateDevicesMutation } from '@/lib/store/services/collocation';

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
  const {
    data: data,
    isLoading,
    // isSuccess,
    isError,
    // error,
  } = useGetCollocationDevicesQuery();

  let collocationDevices = (!isLoading && data.devices) || [];
  const [collocateDevices, { isLoading: isCollocating }] = useCollocateDevicesMutation();

  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );
  const onUpdateSelectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.isLoading,
  );
  const startDate = useSelector((state) => state.selectedCollocateDevices.startDate);
  const endDate = useSelector((state) => state.selectedCollocateDevices.endDate);
  const collocationData = useSelector((state) => state.collocationData.collocationData);

  const handleCollocation = () => {
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

      collocateDevices(body);
      // console.log(collocationData);
    } else {
      console.log('Oops not data found');
    }
  };

  return (
    <Layout>
      {/* SKELETON LOADER */}
      {isLoading && !isError ? (
        <SkeletonFrame />
      ) : (
        <>
          <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Add monitor'}>
            <div className='flex'>
              {onUpdateSelectedCollocateDevices && (
                <Button className={'mr-1'}>
                  <div className='mr-1'>
                    <CheckCircleIcon />
                  </div>{' '}
                  Saved
                </Button>
              )}
              <Button
                className={`rounded-none text-white bg-blue border border-blue font-medium ${
                  selectedCollocateDevices.length > 0
                    ? 'cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                onClick={handleCollocation}
              >
                Start collocation
              </Button>
            </div>
          </NavigationBreadCrumb>
          <ContentBox>
            <div className='grid grid-cols-1 md:grid-cols-3'>
              {/* DEVICE TABLE */}
              <Table collocationDevices={!isLoading && collocationDevices} />
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
