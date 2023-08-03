import { useEffect, useState } from 'react';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import SortByAlphaIcon from '@/icons/Actions/sort_by_alpha.svg';
import ViewWeekIcon from '@/icons/Actions/view_week.svg';
import PagesIcon from '@/icons/pages.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import SearchBar from './SearchBar';
import Button from '../../../Button';
import DataTable from './DataTable';
import moment from 'moment';

const Table = ({ collocationDevices, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentSortOption, setCurrentSortOption] = useState('');
  const [currentSortOrder, setCurrentSortOrder] = useState('');

  useEffect(() => {
    const filterList = collocationDevices.filter((row) =>
      Object.values(row).join('').toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(filterList);
  }, [searchTerm, collocationDevices]);

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handleSort = (sortOption) => {
    let sortedData = [];

    switch (sortOption) {
      case 'newest':
        sortedData =
          sortOption === currentSortOption && currentSortOrder === 'desc'
            ? sortByDate(filteredData, 'asc')
            : sortByDate(filteredData, 'desc');
        break;
      case 'oldest':
        sortedData =
          sortOption === currentSortOption && currentSortOrder === 'asc'
            ? sortByDate(filteredData, 'desc')
            : sortByDate(filteredData, 'asc');
        break;
      case 'ascending':
        sortedData =
          sortOption === currentSortOption && currentSortOrder === 'asc'
            ? sortByDeviceName(filteredData, 'desc')
            : sortByDeviceName(filteredData, 'asc');
        break;
      case 'descending':
        sortedData =
          sortOption === currentSortOption && currentSortOrder === 'desc'
            ? sortByDeviceName(filteredData, 'asc')
            : sortByDeviceName(filteredData, 'desc');
        break;
      default:
        setFilteredData(sortedData);
    }

    setCurrentSortOption(sortOption);
    setCurrentSortOrder(
      sortOption === currentSortOption && currentSortOrder === 'asc' ? 'desc' : 'asc',
    );
    setFilteredData(sortedData);
  };

  const sortByDate = (data, order) => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = moment(a.start_date);
      const dateB = moment(b.start_date);

      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return sortedData;
  };

  const sortByDeviceName = (data, order) => {
    const sortedData = [...data].sort((a, b) => {
      const nameA = a.device_name || '';
      const nameB = b.device_name || '';

      return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return sortedData;
  };

  return (
    <div className='h-full'>
      <div className='flex xl:items-center justify-between flex-wrap md:flex-nowrap px-6'>
        <div className='flex items-center w-full flex-wrap xl:flex-nowrap'>
          <SearchBar onSearch={handleSearch} />
          <div className='md:flex md:items-center w-full'>
            {/* <Button
              className={
                'max-w-[116px] w-full h-9 bg-grey-250 rounded-md text-black-900 text-sm font-medium xl:ml-2 mb-2 md:mb-0'
              }
            >
              <span className='mr-1'>
                <PagesIcon />
              </span>
              {'Status'}
              <span className='ml-1'>
                <ArrowDropDownIcon />
              </span>{' '}
            </Button> */}
            <div className='dropdown md:ml-2'>
              <Button
                className={
                  'max-w-[114px] w-full h-9 bg-grey-250 rounded-md text-black-900 text-sm font-medium'
                }
              >
                <span className='mr-1'>
                  <FilterIcon />
                </span>
                Filter
                <span className='ml-[10px]'>
                  <ArrowDropDownIcon />
                </span>
              </Button>
              <ul className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44'>
                <li
                  role='button'
                  onClick={() => handleSort('newest')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Newest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('oldest')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Oldest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('ascending')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Name A {'-->'} Z</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('descending')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Name Z {'-->'} A</a>
                </li>
              </ul>
            </div>
            <div className='dropdown ml-2'>
              <Button
                tabIndex={0}
                className={
                  'h-9 w-auto bg-grey-250 rounded-md text-black-900 font-medium text-sm mb-1'
                }
              >
                <div className='mr-1'>
                  <SortByAlphaIcon />
                </div>
                Sort by
                <div className='ml-1'>
                  <ArrowDropDownIcon />
                </div>
              </Button>
              <ul
                tabIndex={0}
                className='p-2 shadow dropdown-content menu bg-base-100 rounded-box w-44'
              >
                <li
                  role='button'
                  onClick={() => handleSort('newest')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Newest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('oldest')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Oldest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('ascending')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Name A {'-->'} Z</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('descending')}
                  className='text-sm text-grey leading-5'
                >
                  <a>Name Z {'-->'} A</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* <div className='max-w-[184px] w-full flex md:justify-end mt-2 md:mt-0'>
          <Button
            className={'w-auto h-9 bg-grey-250 rounded-md text-black-900 text-sm font-medium'}
          >
            <span className='mr-1'>
              <ViewWeekIcon />
            </span>
            <span>{'Customize columns'}</span>
          </Button>
        </div> */}
      </div>
      <div className='overflow-x-scroll md:overflow-x-hidden'>
        <DataTable
          filteredData={filteredData.length > 0 && filteredData}
          collocationDevices={collocationDevices}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Table;
