import SelectionMessage from '../../components/SelectionMessage';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../components/DataTable';
import { AqAlertCircle } from '@airqo/icons-react';
import { FILTER_TYPES } from '../constants';

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
  showViewDataButton,
  onViewDataClick,
  deviceCategory, // Add device category prop
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
      {/* Special Device Info Banner */}
      <AnimatePresence>
        {activeFilterKey === FILTER_TYPES.DEVICES && 
         (deviceCategory?.name?.toLowerCase() === 'mobile' || deviceCategory?.name?.toLowerCase() === 'bam') && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AqAlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    {deviceCategory?.name?.toLowerCase() === 'mobile' ? 'Mobile' : 'BAM'} Device Data Download
                  </p>
                  <div className="text-blue-700 dark:text-blue-300">
                    <p className="mb-2">
                      {deviceCategory?.name?.toLowerCase() === 'mobile' 
                        ? 'Mobile devices require specific settings for data download:'
                        : 'BAM (Beta Attenuation Monitoring) devices require specific settings for data download:'
                      }
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Only <strong>Raw data</strong> type is available</li>
                      <li>Only <strong>Raw frequency</strong> option can be used</li>
                      <li>
                        {deviceCategory?.name?.toLowerCase() === 'mobile' 
                          ? 'Devices shown are filtered to mobile-enabled lowcost sensors'
                          : 'Devices shown are filtered to BAM reference monitors'
                        }
                      </li>
                    </ul>
                    <p className="mt-2 text-xs">
                      These settings are automatically applied when {deviceCategory?.name?.toLowerCase()} category is selected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          showViewDataButton={showViewDataButton}
          onViewDataClick={onViewDataClick}
          onRetry={() => handleRetryLoad(activeFilterKey)}
          enableSorting={true}
          enableColumnFilters={true}
          defaultSortColumn="name"
          defaultSortDirection="asc"
        />
      </motion.div>
    </motion.div>
  );
};

export default DataContent;
