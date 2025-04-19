import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import SearchIcon from '@/icons/Common/search_md.svg';
import CloseIcon from '@/icons/close_icon';
import PropTypes from 'prop-types';

/**
 * TopBarSearch - A search input with fuzzy-matching powered by Fuse.js
 * Uses primary theme color for borders, icons, and focus states.
 */
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
      if (data?.length) {
        fuseRef.current = new Fuse(data, fuseOptions);
      }
    }, [data, fuseOptions]);

    useEffect(() => {
      if (focus && inputRef.current) {
        inputRef.current.focus();
      }
      return () => clearTimeout(debounceRef.current);
    }, [focus]);

    const handleSearch = useCallback(
      (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (val.trim() && fuseRef.current) {
            onSearch(fuseRef.current.search(val));
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
        className={`relative flex w-full ${customWidth} items-center ${className}`}
      >
        {/* Floating Search Icon */}
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          className={
            `w-full h-9 text-sm rounded-xl border border-primary ` +
            `pl-12 pr-10 text-primary dark:text-white bg-transparent ` +
            `focus:border-primary focus:ring-2 focus:ring-primary outline-none`
          }
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 p-1 rounded-full text-primary hover:bg-primary/10 focus:outline-none"
          >
            <CloseIcon className="w-full h-full" />
          </button>
        )}
      </div>
    );
  },
);

TopBarSearch.displayName = 'TopBarSearch';

TopBarSearch.propTypes = {
  data: PropTypes.array,
  onSearch: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func,
  focus: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  debounceTime: PropTypes.number,
  fuseOptions: PropTypes.object,
  customWidth: PropTypes.string,
};

export default TopBarSearch;
