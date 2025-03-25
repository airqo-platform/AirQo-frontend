import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@/public/icons/Common/search_md.svg';
import { useDispatch } from 'react-redux';
import { addSearchTerm } from '@/lib/services/search/LocationSearchSlice';
import CloseIcon from '@/public/icons/close_icon';
import { useSelector } from 'react-redux';

const SearchField = ({
  onSearch = () => {},
  onClearSearch = () => {},
  focus = true,
  showSearchResultsNumber = true,
}) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
//   const reduxSearchTerm = useSelector(
//     (state) => state.locationSearch.searchTerm,
//   );

  useEffect(() => {
    if (focus) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [focus]);

  const handleSearch = (searchEvent: { target: { value: any; }; }) => {
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
      <div className="relative w-full flex items-center justify-center border rounded-lg ">
      <div className="absolute left-0 flex items-center justify-center pl-3 bg-white  h-12 rounded-lg ">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          placeholder="Search villages, cities or country"
          className="input pl-10 text-sm text-secondary-neutral-light-800 w-full h-12  rounded-lg bg-white  "
        //   value={reduxSearchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <span
            className="absolute flex justify-center items-center mr-2 h-5 w-5 right-0 pb-[2px] cursor-pointer"
            onClick={clearSearch}
          >
            <CloseIcon width={50} height={50} fill={undefined} strokeWidth={undefined} />
          </span>
        )}
      </div>

      {/* {showSearchResultsNumber &&
        reduxSearchTerm &&
        (reduxSearchTerm.length < 2 ? (
          <div className="bg-secondary-neutral-dark-50 rounded-lg w-full h-5" />
        ) : (
          <p className="text-sm font-medium leading-tight text-secondary-neutral-dark-400">
            Results for{' '}
            <span className="text-secondary-neutral-dark-700">
              "{reduxSearchTerm}"
            </span>
          </p>
        ))} */}
    </>
  );
};

export default SearchField;
