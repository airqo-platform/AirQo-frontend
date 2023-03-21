import { useEffect, useState } from 'react';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import SortByAlphaIcon from '@/icons/Actions/sort_by_alpha.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import SearchBar from '../../SearchBar';
import Button from '../../../Button';
import DataTable from './DataTable';

const DataCompletenessTable = ({ dataCompletenessReults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const filterList =
      dataCompletenessReults.length > 0 &&
      dataCompletenessReults.filter((row) =>
        Object.values(row).join('').toLowerCase().includes(searchTerm.toLowerCase()),
      );
    setFilteredData(filterList);
  }, [searchTerm, dataCompletenessReults]);

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
        ? new Date(a.start_date) - new Date(b.start_date)
        : new Date(b.start_date) - new Date(a.start_date),
    );

    return sortedData;
  };

  const sortByDeviceName = (data, order) => {
    const sortedData = [...data].sort((a, b) =>
      order === 'asc'
        ? a.device_name.localeCompare(b.device_name)
        : b.device_name.localeCompare(a.device_name),
    );
    return sortedData;
  };

  return (
    <>
      <div className='flex items-center flex-wrap md:flex-nowrap w-full px-6'>
        <SearchBar onSearch={handleSearch} />
        <span className='flex ml-6 w-full'>
          <Button
            className={
              'h-9 w-full max-w-[114px] bg-grey-200 rounded-md text-black font-medium mr-2 text-sm'
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
          <div className='dropdown'>
            <Button
              tabIndex={0}
              className={'h-9 w-auto bg-grey-200 rounded-md text-black font-medium mb-1 text-sm'}
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
              className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44'
            >
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
        </span>
      </div>
      <div className='overflow-x-scroll md:overflow-x-hidden pt-3'>
        <DataTable
          filteredData={filteredData.length > 0 && filteredData}
          dataCompletenessReults={dataCompletenessReults}
        />
      </div>
    </>
  );
};

export default DataCompletenessTable;
