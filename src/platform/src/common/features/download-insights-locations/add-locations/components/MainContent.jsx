import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import InfoMessage from '@/components/Messages/InfoMessage';
import ErrorState from '@/common/components/ErrorState';
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
          {getFieldWithFallback(item, ['search_name', 'name', 'location_name'])}
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

// No filters for this view - we want the search on the right and no All/Favorites buttons

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
        <ErrorState
          type={ErrorState.Types.GENERIC}
          title="Error Loading Data"
          description={fetchError?.message || 'Unable to fetch locations data.'}
          primaryAction="Try Again"
          onPrimaryAction={onRetry}
          variant="minimal"
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
        columns={columns}
        selectedRows={selectedSites}
        setSelectedRows={setSelectedSites}
        clearSelectionTrigger={clearSelected}
        loading={loading}
        error={isError}
        errorMessage={fetchError?.message || 'Unable to fetch locations data.'}
        onRetry={onRetry}
        onToggleRow={handleToggleSite}
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
        enableInfiniteScroll={false}
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
