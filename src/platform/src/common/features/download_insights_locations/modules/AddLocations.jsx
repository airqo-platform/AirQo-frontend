'use client';
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DataTable from '../components/DataTable';
import EnhancedFooter from '../components/Footer';
import LocationCard from '../components/LocationCard';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
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

/**
 * Header component for the Add Location modal.
 */
export const AddLocationHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Add Location
  </h3>
);

/**
 * Enhanced LocationCard wrapper component to ensure proper card styling
 */
const EnhancedLocationCard = ({ site, onToggle, isSelected, sidebarBg }) => {
  return (
    <LocationCard
      site={site}
      onToggle={onToggle}
      isLoading={false}
      isSelected={isSelected}
      disableToggle={false}
      cardStyle={{ backgroundColor: sidebarBg || '#f6f6f7' }}
    />
  );
};

/**
 * Sidebar component for AddLocations that displays selected locations
 * with improved animations and transitions
 */
const LocationsSidebar = ({
  sidebarSites,
  selectedSites,
  handleToggleSite,
  loading,
  filteredSites,
  sidebarBg = '#f6f6f7',
}) => {
  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const sidebarSitesContent = useMemo(() => {
    if (loading) {
      // Show a placeholder skeleton
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
        {sidebarSites.map((site) => (
          <motion.div key={site._id} variants={itemVariants} layout>
            <EnhancedLocationCard
              site={site}
              onToggle={() => handleToggleSite(site)}
              isSelected={selectedSites.some((s) => s._id === site._id)}
              sidebarBg={sidebarBg}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }, [
    sidebarSites,
    selectedSites,
    handleToggleSite,
    loading,
    filteredSites.length,
    sidebarBg,
  ]);

  return (
    <motion.div
      className="w-[280px] min-h-[400px] max-h-[658px] overflow-y-auto overflow-x-hidden border-r relative space-y-3 px-4 pt-5 pb-14 flex-shrink-0 bg-white"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {sidebarSitesContent}
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
  // Animation variants for content area
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex-1 h-full px-2 md:px-8 pt-6 pb-4 overflow-y-auto"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {isError ? (
        <motion.div variants={itemVariants}>
          <InfoMessage
            title="Error Loading Data"
            description={
              fetchError?.message || 'Unable to fetch locations data.'
            }
            variant="error"
          />
        </motion.div>
      ) : filteredSites.length === 0 && !loading ? (
        <motion.div variants={itemVariants}>
          <InfoMessage
            title="No Locations Found"
            description="No locations are currently available for selection."
            variant="info"
          />
        </motion.div>
      ) : (
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
      )}
    </motion.div>
  );
};

/**
 * AddLocations component allows users to select locations for monitoring.
 * Users can clear all selections if needed, but must select at least one
 * location before saving.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.sidebarBg - Background color for sidebar
 */
const AddLocations = ({ onClose, sidebarBg = '#f6f6f7' }) => {
  const dispatch = useDispatch();

  // Refs to handle cleanup
  const errorTimeoutRef = useRef(null);
  const dataInitializedRef = useRef(false);

  // Retrieve user preferences from Redux store
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  // Local state management
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Get active group
  const { id: activeGroupId, title: groupTitle } = useGetActiveGroup();

  // Use the SWR hook to fetch sites data
  const {
    data: sitesSummaryData,
    isLoading: loading,
    isError,
    error: fetchError,
  } = useSitesSummary(groupTitle?.toLowerCase(), {
    enabled: !!groupTitle,
  });

  // Filter sites more safely - don't rely just on isOnline property
  const filteredSites = useMemo(() => {
    if (!sitesSummaryData || !Array.isArray(sitesSummaryData)) return [];

    // Check if isOnline property exists in the data
    const hasIsOnlineProperty =
      sitesSummaryData.length > 0 && 'isOnline' in sitesSummaryData[0];

    if (hasIsOnlineProperty) {
      // Filter by isOnline as before
      const onlineSites = sitesSummaryData.filter(
        (site) => site.isOnline === true,
      );

      // If we have online sites, return them, otherwise return all sites
      return onlineSites.length > 0 ? onlineSites : sitesSummaryData;
    }

    // If isOnline property doesn't exist, just return all sites
    return sitesSummaryData;
  }, [sitesSummaryData]);

  // Retrieve user ID from localStorage
  const userID = useMemo(() => {
    const storedUser = localStorage.getItem('loggedUser');
    if (!storedUser) {
      return null;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?._id ?? null;
    } catch (error) {
      console.error('Error parsing loggedUser from localStorage:', error);
      return null;
    }
  }, []);

  // Extract selected site IDs from user preferences
  const selectedSiteIds = useMemo(() => {
    const firstPreference = preferencesData?.[0];
    return firstPreference?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);

  // Improved initialization of selected sites
  useEffect(() => {
    if (
      !loading &&
      filteredSites.length > 0 &&
      selectedSiteIds.length > 0 &&
      !dataInitializedRef.current
    ) {
      // Find matching sites from the filtered sites data
      const matchingSites = filteredSites.filter((site) =>
        selectedSiteIds.includes(site._id),
      );

      if (matchingSites.length > 0) {
        // Important: Set both states to ensure consistency
        setSelectedSites(matchingSites);
        setSidebarSites(matchingSites);
        dataInitializedRef.current = true;

        // Force DataTable to update selection by clearing and resetting selection
        setClearSelected(true);

        // Use a longer timeout to ensure UI components have time to process
        setTimeout(() => {
          setClearSelected(false);

          // Additional timeout to ensure checkbox updates
          setTimeout(() => {
            const checkboxRefresh = document.createEvent('Event');
            checkboxRefresh.initEvent('change', true, true);
            document
              .querySelectorAll('input[type="checkbox"]')
              .forEach((checkbox) => {
                checkbox.dispatchEvent(checkboxRefresh);
              });
          }, 50);
        }, 100);

        console.log(`Initialized ${matchingSites.length} pre-selected sites`);
      }
    }
  }, [loading, filteredSites, selectedSiteIds]);

  // Handle automatic error clearing after 2 seconds
  useEffect(() => {
    if (error) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Set new timeout to clear error after 2 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
        errorTimeoutRef.current = null;
      }, 2000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  /**
   * Clears all selected sites without restrictions.
   */
  const handleClearSelection = useCallback(() => {
    setSelectedSites([]);
    setSidebarSites([]);

    setClearSelected(true);
    setTimeout(() => setClearSelected(false), 100);
    setStatusMessage('');
    setError('');
  }, []);

  /**
   * Toggles the selection of a site.
   * Ensures that both selectedSites and sidebarSites stay in sync.
   */
  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);

      // Check for maximum selection limit (4 sites)
      if (!isSelected && prev.length >= 4) {
        setError('You can select up to 4 locations only.');
        setMessageType(MESSAGE_TYPES.ERROR);
        return prev;
      }

      // Toggle selection
      const newSelection = isSelected
        ? prev.filter((s) => s._id !== site._id)
        : [...prev, site];

      // Update sidebar sites to match selection
      setSidebarSites((sidebarPrev) => {
        if (isSelected) {
          // Remove from sidebar if deselected
          return sidebarPrev.filter((s) => s._id !== site._id);
        } else if (!sidebarPrev.some((s) => s._id === site._id)) {
          // Add to sidebar if selected and not already there
          return [...sidebarPrev, site];
        }
        return sidebarPrev;
      });

      return newSelection;
    });

    // Clear any error message when making a selection
    setError('');
  }, []);

  /**
   * Custom filter function for DataTable.
   */
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

  /**
   * Define filters for the DataTable.
   */
  const filters = useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'favorites', label: 'Favorites' },
    ],
    [],
  );

  /**
   * Flexible column rendering to handle different data structures
   */
  const columnsByFilter = useMemo(() => {
    // Function to safely render location name based on available fields
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

    // Function to safely get field value with fallbacks
    const getFieldWithFallback = (item, fields) => {
      for (const field of fields) {
        if (item[field]) return item[field];
      }
      return 'N/A';
    };

    return {
      all: [
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
      ],
      favorites: [
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
      ],
    };
  }, []);

  /**
   * Handles submission of the selected sites.
   * Validates that at least one site is selected before saving.
   */
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

    if (selectedSites.length > 4) {
      setError('You can select up to 4 locations only.');
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }

    setSubmitLoading(true);
    setStatusMessage('Saving your preferences...');
    setMessageType(MESSAGE_TYPES.INFO);

    // Prepare selected_sites data
    const selectedSitesData = selectedSites.map((site) => {
      const { grids, devices, airqlouds, ...rest } = site;
      return rest;
    });

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

  // Get the footer message and message type
  const footerInfo = useMemo(() => {
    if (error) {
      return { message: error, type: MESSAGE_TYPES.ERROR };
    }

    if (statusMessage) {
      return { message: statusMessage, type: messageType };
    }

    // Show warning when no sites are selected
    if (selectedSites.length === 0) {
      return {
        message: 'Please select at least one location to save',
        type: MESSAGE_TYPES.WARNING,
      };
    }

    return {
      message: `${selectedSites.length} ${selectedSites.length === 1 ? 'location' : 'locations'} selected`,
      type: MESSAGE_TYPES.INFO,
    };
  }, [error, statusMessage, messageType, selectedSites.length]);

  // Page transition animation
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
    >
      {/* Sidebar Component - Exactly 280px width */}
      <LocationsSidebar
        sidebarSites={sidebarSites}
        selectedSites={selectedSites}
        handleToggleSite={handleToggleSite}
        loading={loading}
        filteredSites={filteredSites}
        sidebarBg={sidebarBg}
      />

      {/* Main Content Area */}
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
          disabled={submitLoading || selectedSites.length === 0} // Disable save button when no sites are selected
          minimumSelection={0} // Allow clearing all selections
        />
      </div>
    </motion.div>
  );
};

AddLocations.propTypes = {
  onClose: PropTypes.func.isRequired,
  sidebarBg: PropTypes.string,
};

export default AddLocations;
