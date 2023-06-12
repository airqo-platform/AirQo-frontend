import { useEffect, useState } from 'react';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import SortByAlphaIcon from '@/icons/Actions/sort_by_alpha.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import Button from '../../../Button';
import DataTable from './DataTable';
import { compareAsc, compareDesc, parseISO } from 'date-fns';

const Table = ({ collocationDevices }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [ sortOption, setSortOption] = useState('')

  const [filterOptions, setFilterOptions] = useState('all');

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
  }, [searchTerm, sortOption, collocationDevices]);

  // Check if last page is empty and adjust pagination if necessary
  if (filteredData.length > 0 && endIndex > filteredData.length) {
    startIndex = Math.max(filteredData.length - pageSize, 0);
    endIndex = filteredData.length;
  }

  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearch = (searchTerm, filterOptions) => {
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
        sortedData = filteredData;
        break
    }

    setSortOption(sortOption)
    setFilteredData(sortedData);
  };

  const sortByDate = (data, order) => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = parseISO(a.time);
      const dateB = parseISO(b.time);
  
      return order === 'asc' ? compareAsc(dateA, dateB) : compareDesc(dateA, dateB);
    });
  
    return sortedData;
  };

  const sortByDeviceName = (data, order) => {
    const sortedData = [...data].sort((a, b) => {
      const nameA = a.device || '';
      const nameB = b.device || '';
  
      return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  
    return sortedData;
  };
  
  return (
    <div className='col-span-2 gap-0 pt-6 border-r border-grey-150'>
      <div className='px-6 pb-6'>
        <h3 className='text-xl text-black-600 pb-[2px]'>Select monitor to collocate</h3>
        <h6 className='text-sm text-grey-300'>You can more than one monitor to collocate </h6>
      </div>
      <div className='flex flex-wrap items-center justify-between w-full px-6 pb-6 md:flex-nowrap'>
        <SearchBar onSearch={handleSearch} />
        <div className='flex items-center justify-end w-full'>
          <Button
            className={
              'h-9 w-full max-w-[114px] bg-grey-250 rounded-md text-black-900 font-medium text-sm mr-2'
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
                className={`text-sm text-grey leading-[21px] ${
                  sortOption === 'newest' ? 'font-semibold' : ''
                }`}
              >
                <a>Newest date first</a>
              </li>
              <li
                role='button'
                onClick={() => handleSort('oldest')}
                className={`text-sm text-grey leading-[21px] ${
                  sortOption === 'oldest' ? 'font-semibold' : ''
                }`}
              >
                <a>Oldest date first</a>
              </li>
              <li
                role='button'
                onClick={() => handleSort('ascending')}
                className={`text-sm text-grey leading-[21px] ${
                  sortOption === 'ascending' ? 'font-semibold' : ''
                }`}
              >
                <a>Name A {'-->'} Z</a>
              </li>
              <li
                role='button'
                onClick={() => handleSort('descending')}
                className={`text-sm text-grey leading-[21px] ${
                  sortOption === 'descending' ? 'font-semibold' : ''
                }`}
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
          sortOption={sortOption}
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
