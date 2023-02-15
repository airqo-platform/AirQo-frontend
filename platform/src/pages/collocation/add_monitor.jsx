import Button from '../../common/components/Button';
import Layout from '../../common/components/Layout';
import ArrowLeftIcon from '@/icons/keyboard_backspace.svg';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import KeyboardArrowLeftIcon from '@/icons/keyboard_arrow_left.svg';
import KeyboardArrowRightIcon from '@/icons/keyboard_arrow_right.svg';
import SearchIcon from '@/icons/Actions/search.svg';
import SortByAlphaIcon from '@/icons/Actions/sort_by_alpha.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import {
  useGetCollocationDevicesQuery,
  getCollocationDevices,
  getRunningQueriesThunk,
} from '@/lib/store/services/deviceRegistry';
import { wrapper } from '@/lib/store';
import { humanReadableDate } from '../../core/utils/dateTime';
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

export const DeviceTable = ({ collocationDevices }) => {
  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handlePrevClick = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage(currentPage + 1);
  };

  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = startIndex + pageSize;
  let paginatedData =
    collocationDevices.length > 0 && collocationDevices.slice(startIndex, endIndex);

  if (paginatedData.length === 0 && collocationDevices.length > 0) {
    setCurrentPage(currentPage - 1);
    startIndex = (currentPage - 1) * pageSize;
    endIndex = startIndex + pageSize;
    paginatedData = collocationDevices.slice(startIndex, endIndex);
  }

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center flex-wrap md:flex-nowrap w-auto mb-3 px-6'>
        <div className='relative w-full mb-2 md:mb-0'>
          <div className='absolute my-2 mx-3'>
            <SearchIcon />
          </div>
          <input
            type='text'
            placeholder='Search monitors'
            className='h-9 w-full md:max-w-[280px] bg-[#0000000A] flex justify-center pl-10 rounded-[4px] text-sm border-0'
          />
        </div>

        <div className='flex justify-end items-center w-full'>
          <Button
            className={
              'h-9 w-full max-w-[114px] bg-[#0000000A] rounded-[4px] text-black font-medium mr-2'
            }
          >
            <div className='mr-1'>
              <FilterIcon />
            </div>
            Filters
            <div className='ml-[10px]'>
              <ArrowDropDownIcon />
            </div>
          </Button>
          <Button
            className={
              'h-9 w-full max-w-[114px] bg-[#0000000A] rounded-[4px] text-black font-medium'
            }
          >
            <div className='mr-1'>
              <SortByAlphaIcon />
            </div>
            Sort by
          </Button>
        </div>
      </div>
      <div className='overflow-x-scroll md:overflow-x-hidden'>
        <table className='border-collapse text-sm text-left w-full mb-6'>
          <thead>
            <tr className='border-b border-b-slate-300 text-black'>
              <th scope='col' className='font-normal w-[61px] py-3 px-6'>
                <input type='checkbox' />
              </th>
              <th scope='col' className='font-normal w-[145px] px-4 py-3 opacity-40'>
                Monitor name
              </th>
              <th scope='col' className='font-normal w-[145px] px-4 py-3 opacity-40'>
                Date added
              </th>
              <th scope='col' className='font-normal w-[145px] px-4 py-3 opacity-40'>
                Added by
              </th>
              <th scope='col' className='font-normal w-[209px] px-4 py-3 opacity-40'>
                Comments
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 &&
              paginatedData.map((device) => {
                return (
                  <tr className='border-b border-b-slate-300' key={device._id}>
                    <td scope='row' className='w-[61px] py-3 px-6'>
                      <input type='checkbox' />
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {device.long_name}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {humanReadableDate(device.createdAt)}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {' '}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div className='flex justify-center mb-10'>
          <button
            className='w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] mr-2 disabled:opacity-40'
            onClick={handlePrevClick}
            disabled={currentPage === 1}
          >
            <div className='w-[16.8px] h-[16.8px] flex justify-center items-center'>
              <KeyboardArrowLeftIcon />
            </div>
          </button>
          <button
            className={`w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] disabled:opacity-40`}
            onClick={handleNextClick}
            disabled={endIndex >= collocationDevices.length}
          >
            <div className='w-[16.8px] h-[16.8px] flex justify-center items-center'>
              <KeyboardArrowRightIcon />
            </div>
          </button>
        </div>
        <div></div>
      </div>
    </div>
  );
};

const CollocateDevice = () => {
  const {
    data: data,
    isLoading,
    // isSuccess,
    // isError,
    // error,
  } = useGetCollocationDevicesQuery();

  let collocationDevices = !isLoading && data.devices;
  return (
    <Layout>
      {isLoading && (
        <div className='flex justify-center items-center w-full h-full'>
          <progress className='progress w-56'></progress>
        </div>
      )}

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
        <DeviceTable collocationDevices={!isLoading && collocationDevices} isLoading />
      </div>
    </Layout>
  );
};

export default CollocateDevice;
