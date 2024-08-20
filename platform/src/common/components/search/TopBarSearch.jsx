import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@/icons/Common/search_md.svg';
import { useDispatch } from 'react-redux';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import CloseIcon from '@/icons/close_icon';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const TopBarSearch = ({
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
      <div className="relative w-[191px] flex items-center justify-center">
        <div className="absolute left-0 flex items-center justify-center pl-3 bg-white border h-9 rounded-xl rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          placeholder="Search location..."
          className="input pl-9 text-sm text-secondary-neutral-light-800 w-full h-9 ml-0 rounded-xl bg-white border-input-light-outline focus:border-input-light-outline focus:ring-2 focus:ring-light-blue-500"
          value={reduxSearchTerm}
          onChange={handleSearch}
        />
        {reduxSearchTerm && (
          <span
            className="absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] cursor-pointer"
            onClick={clearSearch}
          >
            <CloseIcon />
          </span>
        )}
      </div>
    </>
  );
};

TopBarSearch.propTypes = {
  onSearch: PropTypes.func,
  onClearSearch: PropTypes.func,
  focus: PropTypes.bool,
  showSearchResultsNumber: PropTypes.bool,
};

export default TopBarSearch;
