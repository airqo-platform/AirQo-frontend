import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { MdIndeterminateCheckBox } from 'react-icons/md';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import Button from '../../../Button';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import TopBarSearch from '../../../search/TopBarSearch';
import TableLoadingSkeleton from './TableLoadingSkeleton';

const DataTable = ({
  data = [],
  selectedSites = [],
  setSelectedSites,
  itemsPerPage = 7,
  clearSites,
  selectedSiteIds = [],
  loading = false,
  onToggleSite,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [activeButton, setActiveButton] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

  // Remove duplicates based on 'id'
  const uniqueData = useMemo(() => {
    const seen = new Set();
    return data.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  // Reset to first page when data or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [uniqueData, activeButton, searchResults]);

  // Update selected sites in parent
  useEffect(() => {
    if (typeof setSelectedSites === 'function') {
      setSelectedSites(selectedSites);
    }
  }, [selectedSites, setSelectedSites]);

  // Clear selections when 'clearSites' changes
  useEffect(() => {
    setSelectedSites([]);
    setSelectAll(false);
    setIndeterminate(false);
  }, [clearSites, setSelectedSites]);

  // Filtered data based on active tab and search
  const filteredData = useMemo(() => {
    let filtered =
      activeButton === 'favorites'
        ? uniqueData.filter((item) => selectedSiteIds.includes(String(item.id)))
        : uniqueData;

    if (searchResults.length > 0) {
      filtered = searchResults.map((result) => result.item);
    }

    return filtered;
  }, [activeButton, uniqueData, selectedSiteIds, searchResults]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage],
  );

  const handleClick = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSelectAllChange = useCallback(() => {
    if (selectAll || indeterminate) {
      setSelectedSites([]);
      setSelectAll(false);
      setIndeterminate(false);
    } else {
      setSelectedSites(filteredData);
      setSelectAll(true);
      setIndeterminate(false);
    }
  }, [selectAll, indeterminate, setSelectedSites, filteredData]);

  // Update selectAll and indeterminate states based on selection
  useEffect(() => {
    if (
      selectedSites.length === filteredData.length &&
      filteredData.length > 0
    ) {
      setSelectAll(true);
      setIndeterminate(false);
    } else if (selectedSites.length > 0) {
      setSelectAll(false);
      setIndeterminate(true);
    } else {
      setSelectAll(false);
      setIndeterminate(false);
    }
  }, [selectedSites, filteredData]);

  const handleSearch = useCallback((results) => {
    setSearchResults(results);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  const renderTableRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex).map((item, index) => (
      <tr
        key={item.id}
        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <td className="w-4 p-4">
          <div className="flex items-center">
            <input
              id={`checkbox-table-search-${startIndex + index}`}
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              checked={selectedSites.some((site) => site.id === item.id)}
              onChange={() => onToggleSite(item)}
            />
            <label
              htmlFor={`checkbox-table-search-${startIndex + index}`}
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
  }, [filteredData, currentPage, itemsPerPage, selectedSites, onToggleSite]);

  return (
    <div className="space-y-4">
      {/* Header with Filters and Search */}
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
          data={uniqueData}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          fuseOptions={{
            keys: ['location', 'city', 'country', 'owner'],
            threshold: 0.3,
          }}
        />
      </div>

      {/* Table or Loading Skeleton */}
      {loading ? (
        <TableLoadingSkeleton />
      ) : (
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
                      {indeterminate ? (
                        <button
                          type="button"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer flex items-center justify-center"
                          onClick={handleSelectAllChange}
                        >
                          <MdIndeterminateCheckBox size={16} />
                        </button>
                      ) : (
                        <input
                          id="checkbox-all-search"
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectAll}
                          onChange={handleSelectAllChange}
                        />
                      )}
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        Select all
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
              <tbody>{renderTableRows}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 items-center">
          <Button
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            Icon={ShortLeftArrow}
            variant="outlined"
            paddingStyles="p-2"
            color={currentPage === 1 ? '#9EA3AA' : '#4B4E56'}
          />
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            Icon={ShortRightArrow}
            variant="outlined"
            paddingStyles="p-2"
            color={currentPage === totalPages ? '#9EA3AA' : '#4B4E56'}
          />
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      location: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
      owner: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedSites: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  setSelectedSites: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number,
  clearSites: PropTypes.bool,
  selectedSiteIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  loading: PropTypes.bool,
  onToggleSite: PropTypes.func.isRequired,
};

export default DataTable;
