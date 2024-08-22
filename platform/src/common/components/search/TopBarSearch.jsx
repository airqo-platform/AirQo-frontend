import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import SearchIcon from '@/icons/Common/search_md.svg';
import CloseIcon from '@/icons/close_icon';
import PropTypes from 'prop-types';

const TopBarSearch = React.memo(
  ({
    data,
    onSearch,
    onClearSearch,
    focus = true,
    placeholder = 'Search...',
    className = '',
    debounceTime = 300,
    fuseOptions = {
      keys: ['name', 'description'], // Adjust these based on your data structure
      threshold: 0.4,
    },
  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const fuseRef = useRef(null);

    useEffect(() => {
      fuseRef.current = new Fuse(data, fuseOptions);
    }, [data, fuseOptions]);

    useEffect(() => {
      if (focus && inputRef.current) {
        inputRef.current.focus();
      }

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [focus]);

    const handleSearch = useCallback(
      (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          if (value.trim()) {
            const results = fuseRef.current.search(value);
            onSearch(results);
          } else {
            onSearch([]);
          }
        }, debounceTime);
      },
      [onSearch, debounceTime]
    );

    const clearSearch = useCallback(() => {
      setSearchTerm('');
      onClearSearch();
    }, [onClearSearch]);

    return (
      <div
        className={`relative flex w-full max-w-[192px] items-center justify-center ${className}`}
      >
        <div className="absolute left-0 flex items-center justify-center pl-3 bg-white border h-9 rounded-xl rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          placeholder={placeholder}
          className="input pl-9 text-sm text-secondary-neutral-light-800 w-full h-9 ml-0 rounded-xl bg-white border-input-light-outline focus:border-input-light-outline focus:ring-2 focus:ring-light-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <span
            className="absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] cursor-pointer"
            onClick={clearSearch}
          >
            <CloseIcon />
          </span>
        )}
      </div>
    );
  }
);

TopBarSearch.propTypes = {
  data: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  focus: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  debounceTime: PropTypes.number,
  fuseOptions: PropTypes.object,
};

export default TopBarSearch;
