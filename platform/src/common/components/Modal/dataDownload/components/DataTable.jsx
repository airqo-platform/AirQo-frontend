import React, { useState, useEffect, useMemo } from 'react';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import Button from '../../../Button';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import TopBarSearch from '../../../search/TopBarSearch';

const DataTable = ({
  setSelectedSites,
  data,
  itemsPerPage = 7,
  clearSelectedSites,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSites, setSelectedSitesState] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [activeButton, setActiveButton] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    if (typeof setSelectedSites === 'function') {
      setSelectedSites(selectedSites);
    }
  }, [selectedSites, setSelectedSites]);

  useEffect(() => {
    if (clearSelectedSites) {
      setSelectedSitesState([]);
      setSelectAll(false);
    }
  }, [clearSelectedSites]);

  const filteredData = useMemo(() => {
    return searchResults.length > 0
      ? searchResults.map((result) => result.item)
      : data;
  }, [searchResults, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleClick = (page) => {
    setCurrentPage(page);
  };

  const handleCheckboxChange = (item) => {
    setSelectedSitesState((prevSelectedSites) => {
      if (prevSelectedSites.includes(item)) {
        return prevSelectedSites.filter((site) => site !== item);
      } else {
        return [...prevSelectedSites, item];
      }
    });
  };

  const handleSelectAllChange = () => {
    setSelectedSitesState(selectAll ? [] : filteredData);
    setSelectAll(!selectAll);
  };

  const handleSearch = (results) => {
    setSearchResults(results);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
  };

  const renderTableRows = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex).map((item, index) => (
      <tr
        key={index}
        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <td className="w-4 p-4">
          <div className="flex items-center">
            <input
              id={`checkbox-table-search-${index}`}
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              checked={selectedSites.includes(item)}
              onChange={() => handleCheckboxChange(item)}
            />
            <label
              htmlFor={`checkbox-table-search-${index}`}
              className="sr-only"
            >
              checkbox
            </label>
          </div>
        </td>
        <th
          scope="row"
          className="py-2 font-medium flex items-center text-gray-900 whitespace-nowrap dark:text-white"
        >
          <span className="p-2 rounded-full bg-[#F6F6F7] mr-3">
            <LocationIcon width={16} height={16} fill="#9EA3AA" />
          </span>
          {item.location.length > 25
            ? `${item.location.substring(0, 25)}...`
            : item.location}
        </th>
        <td className="px-3 py-2">{item.city}</td>
        <td className="px-3 py-2">{item.country}</td>
        <td className="px-3 py-2">{item.owner}</td>
      </tr>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="gap-2 flex items-center">
          <Button
            type="button"
            onClick={() => setActiveButton('all')}
            variant={activeButton === 'all' ? 'filled' : 'outlined'}
          >
            All
          </Button>
          <Button
            type="button"
            onClick={() => setActiveButton('favorites')}
            variant={activeButton === 'favorites' ? 'filled' : 'outlined'}
          >
            Favorites
          </Button>
        </div>
        <TopBarSearch
          data={data}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          fuseOptions={{
            keys: ['location', 'city', 'country', 'owner'],
            threshold: 0.3,
          }}
        />
      </div>
      <div className="relative overflow-x-auto border rounded-xl">
        {filteredData.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No data available.
          </div>
        ) : (
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 border-b capitalize bg-[#f9fafb] dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input
                      id="checkbox-all-search"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                    <label htmlFor="checkbox-all-search" className="sr-only">
                      checkbox
                    </label>
                  </div>
                </th>
                <th scope="col" className="py-3 font-normal">
                  Location
                </th>
                <th scope="col" className="px-3 py-3 font-normal">
                  City
                </th>
                <th scope="col" className="px-3 py-3 font-normal">
                  Country
                </th>
                <th scope="col" className="px-3 py-3 font-normal">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        )}
      </div>
      {filteredData.length > itemsPerPage && (
        <div className="flex justify-center gap-2 items-center">
          <Button
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            Icon={ShortLeftArrow}
            variant={'outlined'}
            paddingStyles="p-2"
            color={currentPage === 1 ? '#9EA3AA' : '#4B4E56'}
          />
          <Button
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            Icon={ShortRightArrow}
            variant={'outlined'}
            paddingStyles="p-2"
            color={currentPage === totalPages ? '#9EA3AA' : '#4B4E56'}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
