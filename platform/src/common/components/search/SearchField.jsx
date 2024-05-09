import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@/icons/Common/search_md.svg';
import { useDispatch } from 'react-redux';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import CloseIcon from '@/icons/close_icon';
import { useSelector } from 'react-redux';

const SearchField = ({
  onSearch = () => {},
  onClearSearch = () => {},
  focus = true,
  showSearchResultsNumber = true,
}) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const reduxSearchTerm = useSelector((state) => state.locationSearch.searchTerm);

  useEffect(() => {
    if (focus) {
      inputRef.current.focus();
    }
  }, [focus]);

  const handleSearch = (searchEvent) => {
    try {
      const searchValue = searchEvent.target.value;
      setSearchTerm(searchValue);
      dispatch(addSearchTerm(searchValue));
      onSearch();
    } catch (err) {
      console.error('Error searching:', err);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onClearSearch();
    dispatch(addSearchTerm(''));
  };

  return (
    <>
      <div className='relative w-full flex items-center justify-center'>
        <div className='absolute left-0 flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          placeholder='Search villages, cities or country'
          className='input pl-10 text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-input-light-outline focus:border-input-light-outline focus:ring-2 focus:ring-light-blue-500'
          value={reduxSearchTerm}
          onChange={handleSearch}
        />
        {reduxSearchTerm && (
          <span
            className='absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] cursor-pointer'
            onClick={clearSearch}
          >
            <CloseIcon />
          </span>
        )}
      </div>
      {showSearchResultsNumber && reduxSearchTerm && reduxSearchTerm.length < 4 && (
        <div className='bg-secondary-neutral-dark-50 rounded-lg w-full h-5' />
      )}
      {showSearchResultsNumber && reduxSearchTerm && reduxSearchTerm.length > 3 && (
        <p className='text-sm font-medium leading-tight text-secondary-neutral-dark-400'>
          Results for <span className='text-secondary-neutral-dark-700'>"{reduxSearchTerm}"</span>
        </p>
      )}
    </>
  );
};

export default SearchField;
