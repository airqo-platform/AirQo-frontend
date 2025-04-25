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

  const handleSearch = (e) => {
    dispatch(addSearchTerm(e.target.value));
    onSearch();
  };

  const clearSearch = () => {
    dispatch(addSearchTerm(''));
    onClearSearch();
  };

  return (
    <>
      <div className="relative w-full flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-transparent focus-within:ring-2 focus-within:ring-primary/30 dark:focus-within:ring-primary/50">
        <div className="absolute left-0 z-10 flex items-center pl-3 h-12 pointer-events-none">
          <SearchIcon className="text-gray-600 dark:text-gray-300" />
        </div>
        <input
          ref={inputRef}
          placeholder="Search villages, cities or country"
          value={reduxSearchTerm}
          onChange={handleSearch}
          className="
            w-full h-12 pl-10 pr-10
            bg-transparent
            text-sm text-secondary-neutral-light-800 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none
          "
        />
        {reduxSearchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            <CloseIcon className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white" />
          </button>
        )}
      </div>

      {showSearchResultsNumber &&
        reduxSearchTerm &&
        (reduxSearchTerm.length < 2 ? (
          <div className="mt-1 h-5 w-full rounded-lg bg-secondary-neutral-dark-50 dark:bg-gray-700" />
        ) : (
          <p className="mt-1 text-sm font-medium text-primary dark:text-primary">
            Results for “{reduxSearchTerm}”
          </p>
        ))}
    </>
  );
};

export default SearchField;
