import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import InfoMessage from '@/components/Messages/InfoMessage';
import { itemVariants } from '../animations';
import { getFieldWithFallback } from '../utils/getFieldWithFallback';
import { AqMarkerPin01 } from '@airqo/icons-react';

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
  canLoadMore,
}) => {
  if (isError) {
    return (
      <motion.div variants={itemVariants}>
        <InfoMessage
          title="Error Loading Data"
          description={fetchError?.message || 'Unable to fetch locations data.'}
          variant="error"
        />
      </motion.div>
    );
  }

  if (!loading && !filteredSites.length) {
    return (
      <motion.div variants={itemVariants}>
        <InfoMessage
          title="No Locations Found"
          description="No locations are currently available for selection."
          variant="info"
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
        onToggleRow={handleToggleSite}
        filters={filters}
        columnsByFilter={{ all: columns, favorites: columns }}
        onFilter={(data, activeFilter) =>
          handleFilter(data, activeFilter, selectedSites)
        }
        searchKeys={[
          'location_name',
          'search_name',
          'name',
          'city',
          'country',
          'data_provider',
          'owner',
          'organization',
        ]}
        enableColumnFilters={true}
        defaultSortColumn="name"
        defaultSortDirection="asc"
        enableInfiniteScroll={true}
        paginationMeta={meta}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
        canLoadMore={canLoadMore}
      />
    </motion.div>
  );
};
