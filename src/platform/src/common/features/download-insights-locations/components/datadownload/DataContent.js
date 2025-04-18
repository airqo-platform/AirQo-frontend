import SelectionMessage from '../SelectionMessage';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../DataTable';

// Filter type constants
export const FILTER_TYPES = {
  COUNTRIES: 'countries',
  CITIES: 'cities',
  SITES: 'sites',
  DEVICES: 'devices',
};

/**
 * DataContent component for DataDownload
 */
const DataContent = ({
  selectedItems,
  clearSelections,
  currentFilterData,
  activeFilterKey,
  selectedRows,
  setSelectedRows,
  clearSelected,
  isLoading,
  filterErrors,
  handleToggleItem,
  columnsByFilter,
  filters,
  handleFilter,
  searchKeysByFilter,
  handleRetryLoad,
}) => {
  // Animation variants for content area
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex-1 h-full px-2 md:px-6 pt-4 pb-4 overflow-y-auto flex flex-col"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Selection info with SelectionMessage component */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SelectionMessage type="info" onClear={clearSelections}>
              {activeFilterKey === FILTER_TYPES.COUNTRIES && selectedItems[0]
                ? `${selectedItems[0]?.name || selectedItems[0]?.long_name || 'Country'} selected for data download`
                : activeFilterKey === FILTER_TYPES.CITIES && selectedItems[0]
                  ? `${selectedItems[0]?.name || selectedItems[0]?.long_name || 'City'} selected for data download`
                  : `${selectedItems.length} ${
                      selectedItems.length === 1
                        ? activeFilterKey === FILTER_TYPES.SITES
                          ? 'monitoring site'
                          : 'device'
                        : activeFilterKey === FILTER_TYPES.SITES
                          ? 'monitoring sites'
                          : 'devices'
                    } selected for data download`}
            </SelectionMessage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection guidance with SelectionMessage component */}
      <AnimatePresence>
        {selectedItems.length === 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SelectionMessage type="info">
              {activeFilterKey === FILTER_TYPES.COUNTRIES ||
              activeFilterKey === FILTER_TYPES.CITIES
                ? `Please select a ${activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city'} to download air quality data (only one selection allowed)`
                : `Please select one or more ${activeFilterKey === FILTER_TYPES.SITES ? 'monitoring sites' : 'devices'} to download air quality data`}
            </SelectionMessage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data table */}
      <motion.div className="flex-grow mt-4" variants={itemVariants}>
        <DataTable
          data={currentFilterData}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          clearSelectionTrigger={clearSelected}
          loading={isLoading}
          error={!!filterErrors[activeFilterKey]}
          errorMessage={filterErrors[activeFilterKey]}
          onToggleRow={handleToggleItem}
          columnsByFilter={columnsByFilter}
          filters={filters}
          onFilter={handleFilter}
          searchKeys={searchKeysByFilter}
          onRetry={() => handleRetryLoad(activeFilterKey)}
        />
      </motion.div>
    </motion.div>
  );
};

export default DataContent;
