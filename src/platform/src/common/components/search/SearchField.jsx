import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '@/icons/Common/search_md.svg';
import CloseIcon from '@/icons/close_icon';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';

const SearchField = ({
  // behavior props
  onSearch = () => {},
  onClearSearch = () => {},
  focus = true,
  showSearchResultsNumber = true,
  minSearchLength = 2,
  placeholder = 'Search villages, cities or country',

  // styling overrides
  wrapperClassName = '',
  inputClassName = '',
  iconWrapperClassName = '',
  clearButtonClassName = '',
  resultContainerClassName = '',
  resultTextClassName = '',
}) => {
  const dispatch = useDispatch();
  const searchTerm = useSelector((s) => s.locationSearch.searchTerm);
  const inputRef = useRef(null);

  useEffect(() => {
    if (focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focus]);

  const handleChange = (e) => {
    dispatch(addSearchTerm(e.target.value));
    onSearch(e);
  };

  const handleClear = () => {
    dispatch(addSearchTerm(''));
    onClearSearch();
    inputRef.current?.focus();
  };

  const hasTerm = Boolean(searchTerm);
  const isTooShort = hasTerm && searchTerm.length < minSearchLength;

  return (
    <>
      <div
        className={clsx(
          'relative w-full flex items-center', // Removed border and ring classes from here
          wrapperClassName,
        )}
      >
        <div
          className={clsx(
            'absolute left-0 z-10 flex items-center pl-3 h-12 pointer-events-none',
            iconWrapperClassName,
          )}
        >
          <SearchIcon className="text-gray-600 dark:text-gray-300" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className={clsx(
            `
            w-full h-12 pl-10 pr-10 rounded-lg text-sm
            bg-white dark:bg-transparent text-secondary-neutral-light-800 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400 
            
            border border-gray-300 dark:border-gray-700 
            transition-colors duration-150 ease-in-out

            hover:border-[var(--org-primary,var(--color-primary,#145fff))]/50

            focus:border-[var(--org-primary,var(--color-primary,#145fff))] focus:ring-1 focus:ring-[var(--org-primary,var(--color-primary,#145fff))] focus:outline-none
            `,
            inputClassName,
          )}
        />

        {hasTerm && (
          <button
            type="button"
            onClick={handleClear}
            className={clsx(
              'absolute right-2 flex items-center justify-center h-5 w-5 cursor-pointer',
              clearButtonClassName,
            )}
          >
            <CloseIcon className="text-gray-600 dark:text-gray-300 hover:text-[var(--org-primary,var(--color-primary,#145fff))] dark:hover:text-white" />
          </button>
        )}
      </div>

      {showSearchResultsNumber &&
        hasTerm &&
        (isTooShort ? (
          <div
            className={clsx(
              'mt-1 h-5 w-full rounded-lg bg-secondary-neutral-dark-50 dark:bg-gray-700',
              resultContainerClassName,
            )}
          />
        ) : (
          <p
            className={clsx(
              'mt-1 text-sm font-medium text-[var(--org-primary,var(--color-primary,#145fff))] dark:text-[var(--org-primary,var(--color-primary,#145fff))]',
              resultTextClassName,
            )}
          >
            Results for “{searchTerm}”
          </p>
        ))}
    </>
  );
};

export default SearchField;
