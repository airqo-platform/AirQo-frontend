import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import SearchIcon from '@/icons/Common/search_md.svg';
import CloseIcon from '@/icons/close_icon';
import PropTypes from 'prop-types';

const TopBarSearch = React.memo(
  ({
    data,
    onSearch,
    onClearSearch = () => {},
    focus = true,
    placeholder = 'Search...',
    className = '',
    debounceTime = 300,
    fuseOptions = {
      keys: ['name', 'description'],
      threshold: 0.4,
    },
    customWidth = 'max-w-[192px]',
  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const fuseRef = useRef(null);

    useEffect(() => {
      if (data && data.length > 0) {
        fuseRef.current = new Fuse(data, fuseOptions);
      }
    }, [data, fuseOptions]);

    useEffect(() => {
      if (focus && inputRef.current) {
        inputRef.current.focus();
      }
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [focus]);

    const handleSearch = useCallback(
      (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (value.trim() && fuseRef.current) {
            const results = fuseRef.current.search(value);
            onSearch(results);
          } else {
            onSearch([]);
          }
        }, debounceTime);
      },
      [onSearch, debounceTime],
    );

    const clearSearch = useCallback(() => {
      setSearchTerm('');
      onClearSearch();
    }, [onClearSearch]);

    return (
      <div
        className={`relative flex w-full ${customWidth} bg-transparent items-center justify-center ${className}`}
      >
        {/* Search Icon Container */}
        <div className="absolute left-0 flex items-center justify-center pl-3 dark:bg-transparent border h-9 rounded-xl rounded-r-none border-r-0 border-input-light-outline dark:border-gray-700 focus:border-input-light-outline">
          <SearchIcon />
        </div>
        {/* Input Field */}
        <input
          ref={inputRef}
          placeholder={placeholder}
          className="input pl-9 text-sm text-secondary-neutral-light-800 dark:text-white w-full h-9 ml-0 rounded-xl dark:bg-transparent border-input-light-outline dark:border-gray-700 focus:border-input-light-outline focus:ring-2 focus:ring-light-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
        {/* Clear Icon */}
        {searchTerm && (
          <span
            className="absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] cursor-pointer dark:text-white"
            onClick={clearSearch}
          >
            <CloseIcon />
          </span>
        )}
      </div>
    );
  },
);

TopBarSearch.displayName = 'TopBarSearch';

TopBarSearch.propTypes = {
  customWidth: PropTypes.string,
  data: PropTypes.array,
  onSearch: PropTypes.func,
  onClearSearch: PropTypes.func,
  focus: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  debounceTime: PropTypes.number,
  fuseOptions: PropTypes.object,
};

export default TopBarSearch;
