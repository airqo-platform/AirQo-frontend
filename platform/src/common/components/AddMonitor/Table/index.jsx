import { useState } from 'react';
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

  const handlePrevClick = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const pageSize = 8;

  // Filter data based on search term
  let filteredData =
    collocationDevices.length > 0 &&
    collocationDevices.filter((device) =>
      Object.values(device).join('').toLowerCase().includes(searchTerm.toLowerCase()),
    );

  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = startIndex + pageSize;
  let paginatedData = collocationDevices.length > 0 && filteredData.slice(startIndex, endIndex);

  // Check if last page is empty and adjust pagination if necessary
  if (paginatedData.length === 0 && collocationDevices.length > 0) {
    setCurrentPage(currentPage - 1);
    startIndex = (currentPage - 1) * pageSize;
    endIndex = startIndex + pageSize;
    paginatedData = collocationDevices.length > 0 && filteredData.slice(startIndex, endIndex);
  }

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
        <DataTable paginatedData={paginatedData} />
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
