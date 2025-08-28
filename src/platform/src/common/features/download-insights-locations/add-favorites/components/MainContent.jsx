import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import InfoMessage from '@/components/Messages/InfoMessage';
import { itemVariants } from '../../add-locations/animations';
import { getFieldWithFallback } from '../../add-locations/utils/getFieldWithFallback';
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
        />
      </motion.div>
    );
  }

  if (!loading && !filteredSites.length) {
    return (
      <motion.div variants={itemVariants}>
        <InfoMessage
          title="No Locations Found"
          description="No locations are currently available to add to your favorites."
          variant="info"
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
        onToggleRow={handleToggleSite}
        filters={filters}
        columnsByFilter={{ all: columns, selected: columns }}
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
      />
    </motion.div>
  );
};
