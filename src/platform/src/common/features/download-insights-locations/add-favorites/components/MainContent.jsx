import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import InfoMessage from '@/components/Messages/InfoMessage';
import Button from '@/common/components/Button';
import { itemVariants } from '../../add-locations/animations';
import { getFieldWithFallback } from '../../add-locations/utils/getFieldWithFallback';
import { AqMarkerPin01 } from '@airqo/icons-react';
import { MdRefresh, MdClear } from 'react-icons/md';

const columns = [
  {
    key: 'search_name',
    label: 'Location',
    render: (item) => (
      <div className="flex items-center">
        <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
          <AqMarkerPin01 size={16} />
        </span>
        <span className="ml-2">
          {item.search_name || item.location_name || item.name || '--'}
        </span>
      </div>
    ),
  },
  {
    key: 'city',
    label: 'City',
    render: (item) => getFieldWithFallback(item, ['city', 'address']),
  },
  {
    key: 'country',
    label: 'Country',
    render: (item) => getFieldWithFallback(item, ['country']),
  },
  {
    key: 'data_provider',
    label: 'Data Provider',
    render: (item) => getFieldWithFallback(item, ['data_provider', 'owner']),
  },
];

const filters = [
  { key: 'all', label: 'All' },
  { key: 'selected', label: 'Selected' },
];

const handleFilter = (data, activeFilter, selectedSites) =>
  activeFilter.key === 'selected' ? selectedSites || [] : data;

export const MainContent = ({
  filteredSites = [],
  selectedSites = [],
  setSelectedSites,
  clearSelected = false,
  loading = false,
  isError = false,
  fetchError = null,
  handleToggleSite,
  meta,
  hasNextPage,
  loadMore,
  nextPage,
  prevPage,
  canLoadMore,
  searchQuery,
  onSearchChange,
  onRetry,
}) => {
  if (isError) {
    return (
      <motion.div variants={itemVariants}>
        <InfoMessage
          title="Error Loading Data"
          description={
            fetchError?.message ||
            'Unable to load location data. Please try again later.'
          }
          variant="error"
          action={
            onRetry && (
              <Button
                variant="filled"
                size="sm"
                onClick={onRetry}
                Icon={MdRefresh}
              >
                Try Again
              </Button>
            )
          }
        />
      </motion.div>
    );
  }

  if (!loading && !filteredSites.length) {
    return (
      <motion.div variants={itemVariants}>
        <InfoMessage
          title="No Locations Found"
          description={
            searchQuery
              ? `No locations found for "${searchQuery}". Try different search terms.`
              : 'No locations are currently available to add to your favorites.'
          }
          variant="info"
          action={
            <div className="flex gap-2 flex-wrap justify-center">
              {onRetry && (
                <Button
                  variant="filled"
                  size="sm"
                  onClick={onRetry}
                  Icon={MdRefresh}
                >
                  Refresh
                </Button>
              )}
              {searchQuery && onSearchChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  Icon={MdClear}
                >
                  Clear Search
                </Button>
              )}
            </div>
          }
        />
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Your Favorite Locations
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose up to 4 locations to add to your favorites. These will be
          easily accessible for quick analysis.
        </p>
      </div>
      <DataTable
        data={filteredSites}
        selectedRows={selectedSites}
        setSelectedRows={setSelectedSites}
        clearSelectionTrigger={clearSelected}
        loading={loading}
        error={isError}
        errorMessage={fetchError?.message || 'Unable to fetch favorites data.'}
        onRetry={onRetry}
        onToggleRow={handleToggleSite}
        filters={filters}
        columnsByFilter={{ all: columns, selected: columns }}
        onFilter={(data, activeFilter) =>
          handleFilter(data, activeFilter, selectedSites)
        }
        enableSearch={true}
        searchKeys={[
          'search_name',
          'location_name',
          'name',
          'city',
          'country',
          'data_provider',
        ]}
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search favorites..."
        enableColumnFilters={true}
        defaultSortColumn="search_name"
        defaultSortDirection="asc"
        enableInfiniteScroll={true}
        paginationMeta={meta}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        canLoadMore={canLoadMore}
      />
    </motion.div>
  );
};
