import React, { useState, useEffect, useRef, memo } from 'react';
import SearchIcon from '@/icons/Common/search_md.svg';
import { useDispatch, useSelector } from 'react-redux';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import CloseIcon from '@/icons/close_icon';
import PropTypes from 'prop-types';

const TopBarSearch = memo(
  ({
    onSearch = () => {},
    onClearSearch = () => {},
    focus = true,
    showSearchResultsNumber = true,
    placeholder = 'Search location...',
    className = '',
  }) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);
    const { searchTerm: reduxSearchTerm } = useSelector((state) => state.locationSearch);

    useEffect(() => {
      if (focus) {
        inputRef.current.focus();
      }
    }, [focus]);

    useEffect(() => {
      setSearchTerm(reduxSearchTerm);
    }, [reduxSearchTerm]);

    const handleSearch = (event) => {
      try {
        const searchValue = event.target.value;
        setSearchTerm(searchValue);
        dispatch(addSearchTerm(searchValue));
        onSearch(searchValue);
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
      <div className={`relative flex w-[192px] items-center justify-center ${className}`}>
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
  onSearch: PropTypes.func,
  onClearSearch: PropTypes.func,
  focus: PropTypes.bool,
  showSearchResultsNumber: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default TopBarSearch;
