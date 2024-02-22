import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import SearchIcon from '@/icons/Common/search_md.svg';

const SearchField = ({ data, onSearch, searchKeys = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: searchKeys,
        isCaseSensitive: false,
        includeScore: true,
        shouldSort: true,
        includeMatches: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        minMatchCharLength: 1,
      }),
    [data, searchKeys],
  );

  const handleSearch = (searchEvent) => {
    try {
      const searchValue = searchEvent.target.value;
      setSearchTerm(searchValue);
      const searchResults = fuse.search(searchValue);
      if (searchResults) {
        onSearch(searchResults.map((result) => result.item));
      } else {
        onSearch([]);
      }
    } catch (err) {
      console.error('Error searching:', err);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch([]);
  };

  return (
    <div className='relative w-full flex items-center justify-center'>
      <div className='absolute left-0 flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
        <SearchIcon />
      </div>
      <input
        placeholder='Search Villages, Cities or Country'
        className='input pl-10 text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-input-light-outline focus:border-input-light-outline focus:ring-2 focus:ring-light-blue-500'
        value={searchTerm}
        onChange={handleSearch}
      />
      {searchTerm && (
        <span
          className='absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] bg-grey-200 rounded-full cursor-pointer'
          onClick={clearSearch}>
          x
        </span>
      )}
    </div>
  );
};

export default SearchField;