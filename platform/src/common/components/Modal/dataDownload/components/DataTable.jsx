import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MdIndeterminateCheckBox } from 'react-icons/md';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import Button from '../../../Button';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import TopBarSearch from '../../../search/TopBarSearch';
import TableLoadingSkeleton from './TableLoadingSkeleton';

/**
 * TableRow Component
 * Renders a single row in the data table.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
const TableRowComponent = ({ item, isSelected, onToggleSite, index }) => (
  <tr
    key={item._id || index} // Fallback to index if _id is not available
    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
  >
    <td className="w-4 p-4">
      <div className="flex items-center">
        <input
          id={`checkbox-table-search-${index}`}
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          checked={isSelected}
          onChange={() => onToggleSite(item)}
        />
        <label htmlFor={`checkbox-table-search-${index}`} className="sr-only">
          Select {item.name || 'Unknown Location'}
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
      {item?.name
        ? item.name.split(',')[0].length > 25
          ? `${item.name.split(',')[0].substring(0, 25)}...`
          : item.name.split(',')[0]
        : 'Unknown Location'}
    </th>
    <td className="px-3 py-2">{item.city || 'N/A'}</td>
    <td className="px-3 py-2">{item.country || 'N/A'}</td>
    <td className="px-3 py-2">{item.data_provider || 'N/A'}</td>
  </tr>
);

const TableRow = React.memo(TableRowComponent);
TableRow.displayName = 'TableRow';

/**
 * DataTable Component
 * Renders a table with data, supports selection, pagination, and search.
 */
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

  /**
   * Remove duplicates based on '_id' using a Set for efficient filtering.
   */
  const uniqueData = useMemo(() => {
    const seen = new Set();
    return data?.filter((item) => {
      if (!item._id || seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
  }, [data]);

  /**
   * Reset to first page when uniqueData, activeButton, or searchResults change.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [uniqueData, activeButton, searchResults]);

  /**
   * Update selected sites in parent component whenever selectedSites changes.
   */
  useEffect(() => {
    if (typeof setSelectedSites === 'function') {
      setSelectedSites(selectedSites);
    }
  }, [selectedSites, setSelectedSites]);

  /**
   * Clear selections when 'clearSites' prop changes.
   */
  useEffect(() => {
    setSelectedSites([]);
    setSelectAll(false);
    setIndeterminate(false);
  }, [clearSites, setSelectedSites]);

  /**
   * Filter data based on active tab ('all' or 'favorites') and search results.
   */
  const filteredData = useMemo(() => {
    let filtered =
      activeButton === 'favorites'
        ? uniqueData?.filter((item) =>
            selectedSiteIds.includes(String(item._id)),
          )
        : uniqueData;

    if (searchResults.length > 0) {
      filtered = searchResults.map((result) => result.item);
    }

    return filtered;
  }, [activeButton, uniqueData, selectedSiteIds, searchResults]);

  /**
   * Calculate total number of pages based on filtered data and items per page.
   */
  const totalPages = useMemo(
    () => Math.ceil(filteredData?.length / itemsPerPage),
    [filteredData, itemsPerPage],
  );

  /**
   * Handle page navigation.
   * @param {number} page - The page number to navigate to.
   */
  const handleClick = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  /**
   * Handle "Select All" checkbox change.
   * Selects or deselects all items based on current selection state.
   */
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

  /**
   * Update "Select All" and "Indeterminate" states based on selectedSites.
   */
  useEffect(() => {
    if (
      selectedSites.length === filteredData?.length &&
      filteredData?.length > 0
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

  /**
   * Handle search results from TopBarSearch component.
   * @param {Array} results - The search results.
   */
  const handleSearch = useCallback((results) => {
    setSearchResults(results);
    setCurrentPage(1);
  }, []);

  /**
   * Clear search results.
   */
  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  /**
   * Render table rows based on current page and filtered data.
   */
  const renderTableRows = useMemo(() => {
    // Ensure filteredData is defined and is an array
    if (!Array.isArray(filteredData)) {
      return null; // Or you can return a placeholder like an empty array `[]` or loading state
    }

    // Calculate start and end index based on pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Handle edge case if filteredData is empty
    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="p-4 text-center text-gray-500">
            No data available
          </td>
        </tr>
      );
    }

    return filteredData
      .slice(startIndex, endIndex)
      .map((item, index) => (
        <TableRow
          key={item._id || index}
          item={item}
          isSelected={selectedSites.some((site) => site._id === item._id)}
          onToggleSite={onToggleSite}
          index={startIndex + index}
        />
      ));
  }, [filteredData, currentPage, itemsPerPage, selectedSites, onToggleSite]);

  return (
    <div className="space-y-4">
      {/* Header with Filters and Search */}
      <div className="flex justify-between items-center">
        {/* Filter Buttons */}
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
        {/* Search Bar */}
        <TopBarSearch
          data={uniqueData}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          fuseOptions={{
            keys: [
              'name',
              'search_name',
              'parish',
              'district',
              'sub_county',
              'city',
              'country',
              'data_provider',
            ],
            threshold: 0.3,
          }}
        />
      </div>

      {/* Table or Loading Skeleton */}
      {loading ? (
        <TableLoadingSkeleton />
      ) : (
        <div className="relative overflow-x-auto border rounded-xl">
          {filteredData && filteredData.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No data available.
            </div>
          ) : (
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              {/* Table Header */}
              <thead className="text-xs text-gray-700 border-b capitalize bg-[#f9fafb] dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {/* Select All Checkbox */}
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      {indeterminate ? (
                        <button
                          type="button"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer flex items-center justify-center"
                          onClick={handleSelectAllChange}
                          aria-label="Select all items"
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
                          aria-label="Select all items"
                        />
                      )}
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        Select all
                      </label>
                    </div>
                  </th>
                  {/* Table Columns */}
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
              {/* Table Body */}
              <tbody>{renderTableRows}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 items-center">
          {/* Previous Page Button */}
          <Button
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            Icon={ShortLeftArrow}
            variant="outlined"
            paddingStyles="p-2"
            color={currentPage === 1 ? '#9EA3AA' : '#4B4E56'}
            aria-label="Previous page"
          />
          {/* Current Page Indicator */}
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          {/* Next Page Button */}
          <Button
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            Icon={ShortRightArrow}
            variant="outlined"
            paddingStyles="p-2"
            color={currentPage === totalPages ? '#9EA3AA' : '#4B4E56'}
            aria-label="Next page"
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
