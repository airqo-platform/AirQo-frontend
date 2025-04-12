'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DataTable from '../components/DataTable';
import EnhancedFooter from '../components/Footer';
import LocationCard from '../components/LocationCard';
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import { useSitesSummary } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import InfoMessage from '@/components/Messages/InfoMessage';
import PropTypes from 'prop-types';

// Message types for footer component
const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const MAX_LOCATIONS = 4;

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
 * Sidebar component for AddLocations that displays selected locations
 */
const LocationsSidebar = ({
  sidebarSites,
  selectedSites,
  handleToggleSite,
  loading,
  filteredSites,
}) => {
  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const renderContent = () => {
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
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        {sidebarSites.map((site) => {
          const isSelected = selectedSites.some((s) => s._id === site._id);
          return (
            <motion.div key={site._id} variants={itemVariants} layout>
              <LocationCard
                site={site}
                onToggle={() => handleToggleSite(site)}
                isLoading={false}
                isSelected={isSelected}
                disableToggle={false}
              />
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <motion.div
      className="w-[280px] min-h-[400px] max-h-[658px] overflow-y-auto overflow-x-hidden border-r dark:border-gray-700 relative space-y-3 px-4 pt-5 pb-14 flex-shrink-0"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {renderContent()}
    </motion.div>
  );
};

/**
 * Main content area component for AddLocations
 */
const LocationsContent = ({
  filteredSites,
  selectedSites,
  setSelectedSites,
  clearSelected,
  loading,
  isError,
  fetchError,
  handleToggleSite,
  columnsByFilter,
  filters,
  handleFilter,
}) => {
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const renderContent = () => {
    if (isError) {
      return (
        <motion.div variants={itemVariants}>
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
    <motion.div
      className="flex-1 h-full px-2 sm:px-6 pt-6 pb-4 overflow-y-auto"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {renderContent()}
    </motion.div>
  );
};

/**
 * AddLocations component allows users to select locations for monitoring.
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 */
const AddLocations = ({ onClose }) => {
  const dispatch = useDispatch();

  // State management
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Get active group
  const { id: activeGroupId, title: groupTitle } = useGetActiveGroup();

  // Get user preferences
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

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

  // Get user ID
  const userID = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('loggedUser');
      if (!storedUser) return null;
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?._id ?? null;
    } catch (error) {
      console.error('Error parsing loggedUser from localStorage:', error);
      return null;
    }
  }, []);

  // Get selected site IDs from preferences
  const selectedSiteIds = useMemo(() => {
    const firstPreference = preferencesData?.[0];
    return firstPreference?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);

  // Initialize selected sites from preferences
  useEffect(() => {
    if (!loading && filteredSites.length > 0 && selectedSiteIds.length > 0) {
      const matchingSites = filteredSites.filter((site) =>
        selectedSiteIds.includes(site._id),
      );

      if (matchingSites.length > 0) {
        setSelectedSites(matchingSites);
        setSidebarSites(matchingSites);
      }
    }
  }, [loading, filteredSites, selectedSiteIds]);

  // Clear all selected sites
  const handleClearSelection = useCallback(() => {
    setSelectedSites([]);
    setSidebarSites([]);
    setClearSelected(true);

    setTimeout(() => setClearSelected(false), 100);

    setStatusMessage('');
    setError('');
  }, []);

  // Toggle site selection
  const handleToggleSite = useCallback((site) => {
    if (!site || !site._id) {
      console.error('Invalid site object passed to handleToggleSite', site);
      return;
    }

    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);

      // If already selected, allow deselection
      if (isSelected) {
        const newSelection = prev.filter((s) => s._id !== site._id);
        setSidebarSites((sidebarPrev) =>
          sidebarPrev.filter((s) => s._id !== site._id),
        );
        setError('');
        return newSelection;
      }

      // Check for maximum selection limit
      if (prev.length >= MAX_LOCATIONS) {
        setError(`You can select up to ${MAX_LOCATIONS} locations only.`);
        setMessageType(MESSAGE_TYPES.ERROR);
        return prev;
      }

      // Add the new selection
      const newSelection = [...prev, site];

      // Update sidebar sites
      setSidebarSites((sidebarPrev) => {
        if (!sidebarPrev.some((s) => s._id === site._id)) {
          return [...sidebarPrev, site];
        }
        return sidebarPrev;
      });

      setError('');
      return newSelection;
    });
  }, []);

  // Filter function for DataTable
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

  // Define filters for DataTable
  const filters = useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'favorites', label: 'Favorites' },
    ],
    [],
  );

  // Define columns for DataTable
  const columnsByFilter = useMemo(() => {
    // Render location name with icon
    const renderLocationName = (item) => {
      const displayName =
        item.search_name ||
        item.name ||
        item.location_name ||
        'Unknown Location';

      return (
        <div className="flex items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mr-3">
            <LocationIcon width={16} height={16} fill="#9EA3AA" />
          </span>
          <span className="ml-2">{displayName}</span>
        </div>
      );
    };

    // Get field with fallbacks
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
        render: renderLocationName,
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

    return {
      all: columns,
      favorites: columns,
    };
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
        dispatch(setRefreshChart(true));
      })
      .catch((err) => {
        setError('Failed to update preferences.');
        setMessageType(MESSAGE_TYPES.ERROR);
        console.error(err);
      })
      .finally(() => {
        setSubmitLoading(false);
        setStatusMessage('');
      });
  }, [selectedSites, userID, dispatch, onClose, activeGroupId]);

  // Get footer info
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
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row h-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      data-testid="add-locations-container"
    >
      {/* Sidebar */}
      <LocationsSidebar
        sidebarSites={sidebarSites}
        selectedSites={selectedSites}
        handleToggleSite={handleToggleSite}
        loading={loading}
        filteredSites={filteredSites}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <LocationsContent
          filteredSites={filteredSites}
          selectedSites={selectedSites}
          setSelectedSites={setSelectedSites}
          clearSelected={clearSelected}
          loading={loading}
          isError={isError}
          fetchError={fetchError}
          handleToggleSite={handleToggleSite}
          columnsByFilter={columnsByFilter}
          filters={filters}
          handleFilter={handleFilter}
        />

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
  );
};

AddLocations.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddLocations;
