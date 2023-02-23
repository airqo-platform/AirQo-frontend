import { useEffect, useState } from 'react';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import SortByAlphaIcon from '@/icons/Actions/sort_by_alpha.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import Button from '../../Button';
import DataTable from './DataTable';

const Table = ({ collocationDevices }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const handlePrevClick = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage(currentPage + 1);
  };

  const pageSize = 8;
  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = startIndex + pageSize;

  useEffect(() => {
    const filterList = collocationDevices.filter((row) =>
      Object.values(row).join('').toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(filterList);
  }, [searchTerm, collocationDevices]);

  // Check if last page is empty and adjust pagination if necessary
  if (filteredData.length > 0 && endIndex > filteredData.length) {
    startIndex = Math.max(filteredData.length - pageSize, 0);
    endIndex = filteredData.length;
  }

  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
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
    <div className='w-full'>
      <div className='flex justify-between items-center flex-wrap md:flex-nowrap w-auto mb-3 px-6'>
        <SearchBar onSearch={handleSearch} />
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
          <div className='dropdown'>
            <Button
              tabIndex={0}
              className={'h-9 w-auto bg-[#0000000A] rounded-[4px] text-black font-medium mb-1'}
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
        </div>
      </div>
      <div className='overflow-x-scroll md:overflow-x-hidden'>
        <DataTable
          paginatedData={paginatedData.length > 0 && paginatedData}
          collocationDevices={collocationDevices}
        />
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredData.length}
          onPrevClick={handlePrevClick}
          onNextClick={handleNextClick}
        />
      </div>
    </div>
  );
};

export default Table;
