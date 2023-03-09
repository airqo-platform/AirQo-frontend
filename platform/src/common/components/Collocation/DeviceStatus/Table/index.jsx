import { useEffect, useState } from 'react';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import SortByAlphaIcon from '@/icons/Actions/sort_by_alpha.svg';
import ViewWeekIcon from '@/icons/Actions/view_week.svg';
import PagesIcon from '@/icons/pages.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import SearchBar from './SearchBar';
import Button from '../../../Button';
import DataTable from './DataTable';

const Table = ({ collocationDevices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

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
        sortedData = sortByDate(filteredData, 'desc');
        break;
      case 'oldest':
        sortedData = sortByDate(filteredData, 'asc');
        break;
      case 'ascending':
        sortedData = sortByDeviceName(filteredData, 'asc');
        break;
      case 'descending':
        sortedData = sortByDeviceName(filteredData, 'desc');
        break;
      default:
        setFilteredData(sortedData);
    }

    setFilteredData(sortedData);
  };

  const sortByDate = (data, order) => {
    const sortedData = [...data].sort((a, b) =>
      order === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt),
    );

    return sortedData;
  };

  const sortByDeviceName = (data, order) => {
    const sortedData = [...data].sort((a, b) =>
      order === 'asc'
        ? a.long_name.localeCompare(b.long_name)
        : b.long_name.localeCompare(a.long_name),
    );
    return sortedData;
  };

  return (
    <div className='h-full'>
      <div className='flex xl:items-center justify-between flex-wrap md:flex-nowrap px-6'>
        <div className='flex items-center w-full flex-wrap xl:flex-nowrap'>
          <SearchBar onSearch={handleSearch} />
          <div className='flex items-center w-full'>
            <Button
              className={
                'max-w-[116px] w-full h-9 bg-grey-250 rounded-[4px] text-black text-sm font-medium xl:ml-2'
              }
            >
              <span className='mr-1'>
                <PagesIcon />
              </span>
              {'Status'}
              <span className='ml-1'>
                <ArrowDropDownIcon />
              </span>{' '}
            </Button>
            <div className='dropdown ml-2'>
              <Button
                className={
                  'max-w-[114px] w-full h-9 bg-grey-250 rounded-[4px] text-black text-sm font-medium'
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
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Newest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('oldest')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Oldest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('ascending')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Name A {'-->'} Z</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('descending')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Name Z {'-->'} A</a>
                </li>
              </ul>
            </div>
            <div className='dropdown ml-2'>
              <Button
                className={
                  'max-w-[121px] w-full h-9 bg-grey-250 rounded-[4px] text-black text-sm font-medium'
                }
              >
                <span className='mr-1'>
                  <SortByAlphaIcon />
                </span>
                <span>{'Sort by'}</span>
                <span className='ml-1'>
                  <ArrowDropDownIcon />
                </span>
              </Button>
              <ul className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44'>
                <li
                  role='button'
                  onClick={() => handleSort('newest')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Newest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('oldest')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Oldest date first</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('ascending')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Name A {'-->'} Z</a>
                </li>
                <li
                  role='button'
                  onClick={() => handleSort('descending')}
                  className='text-sm text-grey leading-[21px]'
                >
                  <a>Name Z {'-->'} A</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='max-w-[184px] w-full flex md:justify-end mt-2 md:mt-0'>
          <Button className={'w-auto h-9 bg-grey-250 rounded-[4px] text-black text-sm font-medium'}>
            <span className='mr-1'>
              <ViewWeekIcon />
            </span>
            <span>{'Customize columns'}</span>
          </Button>
        </div>
      </div>
      <div className='overflow-x-scroll md:overflow-x-hidden'>
        <DataTable
          filteredData={filteredData.length > 0 && filteredData}
          collocationDevices={collocationDevices}
        />
      </div>
    </div>
  );
};

export default Table;
