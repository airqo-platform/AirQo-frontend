import React, { useState, useMemo } from 'react';
import SearchIcon from '@/icons/Common/search_md.svg';

const SearchField = ({ data, onSearch, searchKey }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (onSearch) {
      const results = data.filter(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          searchKey in item &&
          item[searchKey].toLowerCase().includes(term.toLowerCase()),
      );
      onSearch(results);
    }
  };

  const suggestions = useMemo(
    () =>
      data?.filter((item) => item[searchKey].toLowerCase().includes(searchTerm.toLowerCase())) ||
      [],
    [searchTerm, data, searchKey],
  );

  const clearSearch = () => {
    setSearchTerm(''); // Clear the search term
    if (onSearch) {
      onSearch(data); // Reset the search results
    }
  };

  return (
    <div className='relative w-full flex items-center justify-center'>
      <div className='absolute left-0 flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
        <SearchIcon />
      </div>
      <input
        placeholder='Search Villages, Cities or Country'
        className='input pl-10 text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-input-light-outline focus:border-input-light-outline'
        value={searchTerm}
        onChange={handleSearch}
        list='suggestions'
      />
      {searchTerm && (
        <span
          className='absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] bg-grey-200 rounded-full cursor-pointer'
          onClick={clearSearch}>
          x
        </span>
      )}
      <datalist
        id='suggestions'
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: 'white',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        }}>
        {suggestions.map((item, index) => (
          <option key={index} value={item[searchKey]} />
        ))}
      </datalist>
    </div>
  );
};

export default React.memo(SearchField);
