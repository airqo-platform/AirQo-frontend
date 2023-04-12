import SearchIcon from '@/icons/Actions/search.svg';
import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    onSearch(searchTerm);
  };

  return (
    <div className='relative w-full mb-2 md:mb-0'>
      <div className='absolute my-2 mx-3'>
        <SearchIcon />
      </div>
      <input
        type='search'
        placeholder='Search monitors'
        value={searchTerm}
        className='h-9 w-full md:max-w-[280px] bg-[#0000000A] flex justify-center pl-10 rounded-md text-sm border-0 focus:outline-none focus:ring focus:ring-violet-300'
        onChange={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
