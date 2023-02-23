import Button from '../../common/components/Button';
import Layout from '../../common/components/Layout';
import ContentBox from '../../common/components/Layout/content_box';
import NavigationBreadCrumb from '../../common/components/Navigation/breadcrumb';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import ArrowRight from '@/icons/Common/arrow_right_blue.svg';
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

  // AVOID USING ABSOLUTE NAMING FOR CLASSES e.g text-[#1C1B1F]. CONFIGURE STYLES IN THE tailwind.config.js FILE TO ENCOURAGE REUSABILITY AND EASY MAINTENANCE
  // CREATE COMPONENTS FOR REPETITIVE LAYOUTS. FOLDER: src/common/components/Layout
  // CREATE FOLDERS FOR IMAGES AND ICONS. FOLDER: public/icons/${folder}/...

  return (
    <div className='border-r border-grey-150 col-span-2 gap-0'>
      <div>
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
            }>
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
            }>
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
            disabled={currentPage === 1}>
            <div className='w-[16.8px] h-[16.8px] flex justify-center items-center'>
              <KeyboardArrowLeftIcon />
            </div>
          </button>
          <button
            className={`w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] disabled:opacity-40`}
            onClick={handleNextClick}
            disabled={endIndex >= collocationDevices.length}>
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

const AddMonitor = () => {
  const {
    data: data,
    isLoading,
    // isSuccess,
    // isError,
    // error,
  } = useGetCollocationDevicesQuery();

  // Errors comes from this line of code, appended
  let collocationDevices = !isLoading && []; 

  const collocationDurations = [4, 7, 14];
  const [duration, setDuration] = useState(new Date());
  const value = format(duration, 'dd/mm/yyyy');
  return (
    <Layout>
      {isLoading && (
        <div className='flex justify-center items-center w-full h-full'>
          <progress className='progress w-56'></progress>
        </div>
      )}

      <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Add monitor'}>
        <button
          className='flex justify-center items-center btn btn-blue normal-case gap-2 rounded-none bg-blue border-transparent hover:bg-dark-blue hover:border-dark-blue text-base'
          disabled>
          Start collocation
        </button>
      </NavigationBreadCrumb>
      <ContentBox>
        <div className='grid grid-cols-1 md:grid-cols-3'>
          <DeviceTable collocationDevices={!isLoading && collocationDevices} isLoading />
          {/* CALENDAR */}
          <div className='px-8 py-6'>
            <div>
              <h3 className='font-medium text-2xl'> Choose collocation period</h3>
              <h5 className='text text-light-text mb-4'> Select your collocation period.</h5>
              {collocationDurations.length > 0 ? (
                collocationDurations.map((duration) => (
                  <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center font-medium'>
                    {duration} {'days'}
                    <input type='radio' />
                  </div>
                ))
              ) : (
                <div />
              )}
              <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center font-medium'>
                Custom
                <input type='radio' />
              </div>
            </div>
            <div className='my-8 flex flex-row justify-between items-center'>
              {/* TODO: Duration upon range selection */}
              <span className='border border-grey-100 rounded-md py-1 px-3 opacity-50 tracking-wide'>
                {value}
              </span>
              <span className='bg-baby-blue h-8 w-8 flex justify-center items-center'>
                <ArrowRight />
              </span>
              <span className='border border-grey-100 rounded-md py-1 px-3 opacity-50 tracking-wide'>
                {value}
              </span>
            </div>
            {/* TODO: Calendar styling and connecting duration */}
            <div>
              <Calendar onChange={setDuration} value={duration} selectRange={true} />
            </div>
          </div>
        </div>
      </ContentBox>
    </Layout>
  );
};

export default AddMonitor;
