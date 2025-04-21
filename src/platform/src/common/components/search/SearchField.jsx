import React, { useEffect, useRef } from 'react';
import SearchIcon from '@/icons/Common/search_md.svg';
import { useDispatch, useSelector } from 'react-redux';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import CloseIcon from '@/icons/close_icon';

const SearchField = ({
  onSearch = () => {},
  onClearSearch = () => {},
  focus = true,
  showSearchResultsNumber = true,
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const reduxSearchTerm = useSelector(
    (state) => state.locationSearch.searchTerm,
  );

  useEffect(() => {
    if (focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focus]);

  const handleSearch = (searchEvent) => {
    const searchValue = searchEvent.target.value;
    dispatch(addSearchTerm(searchValue));
    onSearch();
  };

  const clearSearch = () => {
    dispatch(addSearchTerm(''));
    onClearSearch();
  };

  return (
    <>
      <div className="relative w-full flex items-center justify-center">
        <div className="absolute left-0 flex items-center justify-center pl-3 bg-white dark:bg-transparent border h-12 rounded-lg rounded-r-none border-r-0 border-gray-300 dark:border-gray-700 focus:border-gray-300 dark:focus:border-gray-700">
          <SearchIcon className="text-gray-600 dark:text-gray-300" />
        </div>
        <input
          ref={inputRef}
          placeholder="Search villages, cities or country"
          className="input pl-10 text-sm text-secondary-neutral-light-800 dark:text-white w-full h-12 ml-0 rounded-lg bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50"
          value={reduxSearchTerm}
          onChange={handleSearch}
        />
        {reduxSearchTerm && (
          <span
            className="absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] cursor-pointer hover:text-primary transition-colors duration-200"
            onClick={clearSearch}
          >
            <CloseIcon className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary" />
          </span>
        )}
      </div>

      {showSearchResultsNumber &&
        reduxSearchTerm &&
        (reduxSearchTerm.length < 2 ? (
          <div className="bg-secondary-neutral-dark-50 dark:bg-gray-700 rounded-lg w-full h-5" />
        ) : (
          <p className="text-sm font-medium leading-tight text-primary dark:text-primary">
            Results for &quot;{reduxSearchTerm}&quot;
          </p>
        ))}
    </>
  );
};

export default SearchField;
