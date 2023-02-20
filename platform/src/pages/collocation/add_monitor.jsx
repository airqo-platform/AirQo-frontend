import Button from '../../common/components/Button';
import Layout from '../../common/components/Layout';
import ArrowLeftIcon from '@/icons/keyboard_backspace.svg';
import {
  useGetCollocationDevicesQuery,
  getCollocationDevices,
  getRunningQueriesThunk,
} from '@/lib/store/services/deviceRegistry';
import { wrapper } from '@/lib/store';
import Table from '../../common/components/AddMonitor/Table';

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
    // isError,
    // error,
  } = useGetCollocationDevicesQuery();

  let collocationDevices = !isLoading && data.devices;
  return (
    <>
      {isLoading ? (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center'>
          <progress className='progress w-56'></progress>
        </div>
      ) : (
        <Layout>
          <div className='flex justify-between px-6 py-8'>
            <div className='flex items-center'>
              <div className='border border-grey rounded-[4px] w-7 h-7 flex items-center justify-center mr-4'>
                <span className='text-xl opacity-50'>
                  <ArrowLeftIcon />
                </span>
              </div>

              <span className='text-xl font-semibold'>Add Device</span>
            </div>
            <Button
              className={
                'rounded-none text-white bg-blue border border-blue font-medium opacity-40 cursor-not-allowed'
              }
            >
              Start collocation
            </Button>
          </div>
          <div className='mx-6 mb-6 border-[0.5px] rounded-lg border-[#363A4429] md:max-w-[704px] w-auto'>
            <div className='mb-6 p-6'>
              <h3 className='text-xl mb-[2px] text-[#202223]'>Select monitor to collocate</h3>
              <h4 className='text-sm text-[#6D7175]'>
                You can choose more than one monitor to collocate{' '}
              </h4>
            </div>
            <Table collocationDevices={!isLoading && collocationDevices} />
          </div>
        </Layout>
      )}
    </>
  );
};

export default AddMonitor;
