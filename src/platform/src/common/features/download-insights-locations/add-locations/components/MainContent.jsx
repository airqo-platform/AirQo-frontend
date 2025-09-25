import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import InfoMessage from '@/components/Messages/InfoMessage';
import Button from '@/common/components/Button';
import { itemVariants } from '../animations';
import { getFieldWithFallback } from '../utils/getFieldWithFallback';
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
    label: 'Owner',
    render: (item) =>
      getFieldWithFallback(item, ['data_provider', 'owner', 'organization']),
  },
];

const filters = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
];

const handleFilter = (data, activeFilter, selectedSites) =>
  activeFilter.key === 'favorites'
    ? data.filter((site) => selectedSites.some((s) => s._id === site._id))
    : data;

export const MainContent = ({
  filteredSites,
  selectedSites,
  setSelectedSites,
  clearSelected,
  loading,
  isError,
  fetchError,
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
          description={fetchError?.message || 'Unable to fetch locations data.'}
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
              : 'No locations are currently available for selection.'
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
      <DataTable
        data={filteredSites}
        selectedRows={selectedSites}
        setSelectedRows={setSelectedSites}
        clearSelectionTrigger={clearSelected}
        loading={loading}
        error={isError}
        errorMessage={fetchError?.message || 'Unable to fetch locations data.'}
        onRetry={onRetry}
        onToggleRow={handleToggleSite}
        filters={filters}
        columnsByFilter={{ all: columns, favorites: columns }}
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
          'owner',
          'organization',
        ]}
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search locations..."
        enableColumnFilters={true}
        defaultSortColumn="name"
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
