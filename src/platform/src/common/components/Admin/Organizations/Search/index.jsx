import { AqSearchSm } from '@airqo/icons-react';

const SearchBar = ({ value, onChange, placeholder = 'Search' }) => {
  return (
    <div className="relative mb-2 xl:mb-0 h-9 w-full xl:max-w-[280px]">
      <span className="absolute my-2 mx-3 dark:text-[#1f2937]">
        <AqSearchSm />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white dark:bg-[#1d1f20] text-gray-400 flex justify-center pl-10 rounded-md text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring focus:ring-violet-300"
      />
    </div>
  );
};

export default SearchBar;
