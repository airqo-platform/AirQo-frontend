'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosMenu } from 'react-icons/io';
import Close from '@/icons/close_icon';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DataTable from '../components/DataTable';
import EnhancedFooter from '../components/Footer';
import LocationCard from '../components/LocationCard';
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import {
  setRefreshChart,
  setChartSites,
} from '@/lib/store/services/charts/ChartSlice';
import { useSitesSummary } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import InfoMessage from '@/components/Messages/InfoMessage';
import PropTypes from 'prop-types';
import { useChecklistSteps } from '@/features/Checklist/hooks/useChecklistSteps';
import useLocationSelection from '../hooks/useLocationSelection';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MAX_LOCATIONS, MESSAGE_TYPES } from '../constants';

/**
 * Header component for the Add Location modal.
 */
export const AddLocationHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium dark:text-white"
    id="modal-title"
  >
    Add Location
  </h3>
);

/**
 * Combined component for AddLocations
 */
const AddLocations = ({ onClose }) => {
  const dispatch = useDispatch();
  const { completeStep } = useChecklistSteps();
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isMobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  // Get active group
  const { id: activeGroupId, title: groupTitle } = useGetActiveGroup();

  // Get user preferences
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const selectedSiteIds = useMemo(() => {
    const firstPreference = preferencesData?.[0];
    return firstPreference?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);
  // Get user ID from useGetActiveGroup hook
  const { userID } = useGetActiveGroup();

  // Fetch sites data
  const {
    data: sitesSummaryData,
    isLoading: loading,
    isError,
    error: fetchError,
  } = useSitesSummary(groupTitle?.toLowerCase(), {
    enabled: !!groupTitle,
  });

  // Filter sites
  const filteredSites = useMemo(() => {
    if (!sitesSummaryData || !Array.isArray(sitesSummaryData)) return [];

    const hasIsOnlineProperty =
      sitesSummaryData.length > 0 && 'isOnline' in sitesSummaryData[0];

    if (hasIsOnlineProperty) {
      const onlineSites = sitesSummaryData.filter(
        (site) => site.isOnline === true,
      );
      return onlineSites.length > 0 ? onlineSites : sitesSummaryData;
    }

    return sitesSummaryData;
  }, [sitesSummaryData]);

  // Use custom hook for location selection
  const {
    selectedSites,
    setSelectedSites, // Make sure to include this in the hook return
    sidebarSites,
    clearSelected,
    error,
    setError,
    handleClearSelection,
    handleToggleSite,
  } = useLocationSelection(filteredSites, selectedSiteIds);

  // DataTable configuration
  const filters = useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'favorites', label: 'Favorites' },
    ],
    [],
  );

  const handleFilter = useCallback(
    (data, activeFilter) => {
      if (activeFilter.key === 'favorites') {
        return data.filter((site) =>
          selectedSites.some((s) => s._id === site._id),
        );
      }
      return data;
    },
    [selectedSites],
  );

  const columnsByFilter = useMemo(() => {
    // Helper function to get field with fallbacks
    const getFieldWithFallback = (item, fields) => {
      for (const field of fields) {
        if (item[field]) return item[field];
      }
      return 'N/A';
    };

    const columns = [
      {
        key: 'name',
        label: 'Location',
        render: (item) => (
          <div className="flex items-center">
            <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
              <LocationIcon width={16} height={16} />
            </span>
            <span className="ml-2">
              {item.search_name ||
                item.name ||
                item.location_name ||
                'Unknown Location'}
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
          getFieldWithFallback(item, [
            'data_provider',
            'owner',
            'organization',
          ]),
      },
    ];

    return { all: columns, favorites: columns };
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (selectedSites.length === 0) {
      setError('Please select at least one location to save.');
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }

    if (!userID) {
      setError('User not found.');
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }

    if (selectedSites.length > MAX_LOCATIONS) {
      setError(`You can select up to ${MAX_LOCATIONS} locations only.`);
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }

    setSubmitLoading(true);
    setStatusMessage('Saving your preferences...');
    setMessageType(MESSAGE_TYPES.INFO);

    // Prepare sites data
    const selectedSitesData = selectedSites.map(
      ({ grids, devices, airqlouds, ...rest }) => rest,
    );

    const payload = {
      user_id: userID,
      group_id: activeGroupId,
      selected_sites: selectedSitesData,
    };

    dispatch(replaceUserPreferences(payload))
      .then(() => {
        onClose();
        if (userID) {
          dispatch(
            getIndividualUserPreferences({
              identifier: userID,
              groupID: activeGroupId,
            }),
          );
        }

        // For organizations, also update chart sites directly
        const selectedSiteIds = selectedSitesData
          .map((site) => site._id)
          .filter(Boolean);
        if (selectedSiteIds.length > 0) {
          dispatch(setChartSites(selectedSiteIds));
        }

        dispatch(setRefreshChart(true));
        completeStep(1);
      })
      .catch((_err) => {
        setError('Failed to update preferences.');
        setMessageType(MESSAGE_TYPES.ERROR);
        // Log error for debugging but avoid console in production
      })
      .finally(() => {
        setSubmitLoading(false);
        setStatusMessage('');
      });
  }, [
    selectedSites,
    userID,
    dispatch,
    onClose,
    activeGroupId,
    setError,
    completeStep,
  ]);

  // Determine footer message and type
  const footerInfo = useMemo(() => {
    if (error) {
      return { message: error, type: MESSAGE_TYPES.ERROR };
    }

    if (statusMessage) {
      return { message: statusMessage, type: messageType };
    }

    if (selectedSites.length === 0) {
      return {
        message: 'Please select at least one location to save',
        type: MESSAGE_TYPES.WARNING,
      };
    }

    if (selectedSites.length === MAX_LOCATIONS) {
      return {
        message: `Maximum of ${MAX_LOCATIONS} locations selected`,
        type: MESSAGE_TYPES.WARNING,
      };
    }

    return {
      message: `${selectedSites.length} ${selectedSites.length === 1 ? 'location' : 'locations'} selected`,
      type: MESSAGE_TYPES.INFO,
    };
  }, [error, statusMessage, messageType, selectedSites.length]);

  // Animation variants
  const animations = {
    pageVariants: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    },
    sidebarVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.3, staggerChildren: 0.07 },
      },
    },
    itemVariants: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    },
  };

  // Sidebar content renderer
  const renderSidebarContent = () => {
    if (loading) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-start items-center space-y-2">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="animate-pulse h-10 w-full bg-gray-200 rounded"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      );
    }

    if (!filteredSites.length) {
      return (
        <InfoMessage
          title="No data available"
          description="The system couldn't retrieve location data. Please try again later."
          variant="info"
        />
      );
    }

    if (sidebarSites.length === 0) {
      return (
        <InfoMessage
          title="No locations selected"
          description="Select a location from the table to add it here."
          variant="info"
        />
      );
    }

    return (
      <motion.div
        className="space-y-3"
        variants={animations.sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        {sidebarSites.map((site) => (
          <motion.div key={site._id} variants={animations.itemVariants} layout>
            <LocationCard
              site={site}
              onToggle={() => handleToggleSite(site)}
              isLoading={false}
              isSelected={selectedSites.some((s) => s._id === site._id)}
              disableToggle={false}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Main content renderer
  const renderMainContent = () => {
    if (isError) {
      return (
        <motion.div variants={animations.itemVariants}>
          <InfoMessage
            title="Error Loading Data"
            description={
              fetchError?.message || 'Unable to fetch locations data.'
            }
            variant="error"
          />
        </motion.div>
      );
    }

    if (filteredSites.length === 0 && !loading) {
      return (
        <motion.div variants={animations.itemVariants}>
          <InfoMessage
            title="No Locations Found"
            description="No locations are currently available for selection."
            variant="info"
          />
        </motion.div>
      );
    }

    return (
      <motion.div variants={animations.itemVariants}>
        <DataTable
          data={filteredSites}
          selectedRows={selectedSites}
          setSelectedRows={setSelectedSites}
          clearSelectionTrigger={clearSelected}
          loading={loading}
          error={isError}
          errorMessage={
            fetchError?.message || 'Unable to fetch locations data.'
          }
          onToggleRow={handleToggleSite}
          filters={filters}
          columnsByFilter={columnsByFilter}
          onFilter={handleFilter}
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
        />
      </motion.div>
    );
  };

  return (
    <ErrorBoundary name="AddLocation" feature="Add Locations">
      <motion.div
        className="relative flex flex-col lg:flex-row h-full overflow-x-hidden"
        variants={animations.pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-testid="add-locations-container"
      >
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <motion.div
            className="w-[280px] min-h-[400px] max-h-[658px] h-full overflow-y-auto overflow-x-hidden border-r dark:border-gray-700 relative space-y-3 px-4 pt-5 pb-14 flex-shrink-0"
            variants={animations.sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {renderSidebarContent()}
          </motion.div>
        </div>

        {/* Mobile/Tablet Menu Button */}
        <div className="lg:hidden px-4 md:px-6 pt-2">
          <button
            onClick={() => setMobileSidebarVisible(true)}
            aria-label="Open sidebar menu"
          >
            <IoIosMenu size={24} />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarVisible && (
            <motion.div
              className="absolute inset-0 z-50 flex h-full overflow-x-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-[280px] h-full bg-white dark:bg-[#1d1f20] overflow-x-hidden overflow-y-auto shadow-lg"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
              >
                <div className="p-2 flex justify-end">
                  <button
                    onClick={() => setMobileSidebarVisible(false)}
                    aria-label="Close sidebar menu"
                  >
                    <Close />
                  </button>
                </div>
                <div className="px-2">{renderSidebarContent()}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-x-hidden">
          <motion.div
            className="flex-1 h-full px-2 sm:px-6 pt-6 pb-4 overflow-y-auto overflow-x-hidden"
            variants={animations.sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {renderMainContent()}
          </motion.div>

          <EnhancedFooter
            btnText={submitLoading ? 'Saving...' : 'Save'}
            setError={setError}
            message={footerInfo.message}
            messageType={footerInfo.type}
            selectedItems={selectedSites}
            handleClearSelection={
              selectedSites.length > 0 ? handleClearSelection : undefined
            }
            handleSubmit={handleSubmit}
            onClose={onClose}
            loading={submitLoading}
            disabled={submitLoading || selectedSites.length === 0}
            minimumSelection={0}
          />
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

AddLocations.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddLocations;
