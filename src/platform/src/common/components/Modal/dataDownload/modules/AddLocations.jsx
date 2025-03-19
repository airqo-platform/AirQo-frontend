import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DataTable from '../components/DataTable';
import Footer from '../components/Footer';
import LocationCard from '../components/LocationCard';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { useSitesSummary } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { MdInfoOutline } from 'react-icons/md';

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
 * AddLocations component allows users to select locations for monitoring.
 */
const AddLocations = ({ onClose }) => {
  const dispatch = useDispatch();

  // Retrieve user preferences from Redux store
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  // Local state management
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

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

  // FIXED: Filter sites more safely - don't rely just on isOnline property
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

  /**
   * Initialize selectedSites and sidebarSites once data is loaded,
   * if the user currently has preferences but no local selection.
   */
  useEffect(() => {
    // FIXED: Added a log statement to debug initialization
    console.log('Initializing sites with:', {
      loading,
      selectedSitesLength: selectedSites.length,
      selectedSiteIdsLength: selectedSiteIds.length,
      filteredSitesLength: filteredSites.length,
    });

    if (!loading && filteredSites.length > 0) {
      // If we have user preferences, initialize selection based on them
      if (selectedSites.length === 0 && selectedSiteIds.length > 0) {
        const initialSelectedSites = filteredSites.filter((site) =>
          selectedSiteIds.includes(site._id),
        );

        console.log(
          'Setting initial selected sites:',
          initialSelectedSites.length,
        );

        if (initialSelectedSites.length > 0) {
          setSelectedSites(initialSelectedSites);
          setSidebarSites(initialSelectedSites);
        }
      }
      // If we have filteredSites but no selections at all, initialize sidebar with empty array
      // to ensure the component knows data is available
      else if (selectedSites.length === 0 && sidebarSites.length === 0) {
        setSidebarSites([]);
      }
    }
  }, [
    loading,
    selectedSites.length,
    selectedSiteIds,
    filteredSites,
    sidebarSites.length,
  ]);

  /**
   * Clears all selected sites.
   */
  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    setSidebarSites([]);
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  /**
   * Toggles the selection of a site.
   */
  const handleToggleSite = useCallback((site) => {
    // FIXED: Added console log to debug toggle action
    console.log('Toggling site:', site._id, site.search_name || site.name);

    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);
      return isSelected
        ? prev.filter((s) => s._id !== site._id)
        : [...prev, site];
    });

    setSidebarSites((prev) => {
      const alreadyInSidebar = prev.some((s) => s._id === site._id);
      if (alreadyInSidebar) {
        // If we're removing from selected, also remove from sidebar
        return prev.filter((s) => s._id !== site._id);
      }
      return [...prev, site];
    });
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
   * FIXED: Flexible column rendering to handle different data structures
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
   */
  const handleSubmit = useCallback(() => {
    if (selectedSites.length === 0) {
      setError('No locations selected.');
      return;
    }
    if (!userID) {
      setError('User not found.');
      return;
    }
    if (selectedSites.length > 4) {
      setError('You can select up to 4 locations only.');
      return;
    }

    setSubmitLoading(true);

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
        console.error(err);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  }, [selectedSites, userID, dispatch, onClose, activeGroupId]);

  /**
   * FIXED: Enhanced sidebar content generation with better handling of different site data structures
   */
  const sidebarSitesContent = useMemo(() => {
    if (loading) {
      // Show a placeholder skeleton or spinner
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-start items-center space-y-2">
          <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
        </div>
      );
    }

    // FIXED: Add a debug log to check sidebar sites state
    console.log('Rendering sidebar with:', {
      sidebarSitesLength: sidebarSites.length,
      selectedSitesLength: selectedSites.length,
      filteredSitesLength: filteredSites.length,
    });

    if (!filteredSites.length) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-start text-center items-center p-4">
          <MdInfoOutline className="text-4xl mb-2" />
          <p className="text-lg font-medium mb-1">No data available</p>
          <p className="text-sm text-center">
            The system couldn&apos;t retrieve location data. Please try again
            later.
          </p>
        </div>
      );
    }

    if (sidebarSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-start text-center items-center p-4">
          <MdInfoOutline className="text-4xl mb-2" />
          <p className="text-lg font-medium mb-1">No locations selected</p>
          <p className="text-sm text-center">
            Select a location from the table to add it here.
          </p>
        </div>
      );
    }

    return sidebarSites.map((site) => (
      <LocationCard
        key={site._id}
        site={site}
        onToggle={() => handleToggleSite(site)}
        isLoading={false}
        isSelected={selectedSites.some((s) => s._id === site._id)}
      />
    ));
  }, [
    sidebarSites,
    selectedSites,
    handleToggleSite,
    loading,
    filteredSites.length,
  ]);

  // FIXED: Add debug info about data availability
  console.log('Component data state:', {
    rawDataLength: sitesSummaryData?.length || 0,
    filteredDataLength: filteredSites.length,
    selectedLength: selectedSites.length,
    sidebarLength: sidebarSites.length,
    loading,
    isError,
  });

  return (
    <>
      {/* Sidebar for Selected Sites */}
      <div className="w-auto h-auto md:w-[280px] md:h-[658px] overflow-y-auto md:border-r relative space-y-3 px-4 pt-5 pb-14">
        {sidebarSitesContent}
      </div>

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-2 md:px-8 pt-6 pb-4 overflow-y-auto">
          {/* FIXED: Add better error/loading states for the DataTable */}
          {isError ? (
            <div className="bg-red-50 p-4 rounded border border-red-200 text-center">
              <MdInfoOutline className="text-red-500 text-3xl mx-auto mb-2" />
              <p className="text-red-800 font-medium">Error Loading Data</p>
              <p className="text-red-600 text-sm mt-1">
                {fetchError?.message || 'Unable to fetch locations data.'}
              </p>
            </div>
          ) : filteredSites.length === 0 && !loading ? (
            <div className="bg-blue-50 p-4 rounded border border-blue-200 text-center">
              <MdInfoOutline className="text-blue-500 text-3xl mx-auto mb-2" />
              <p className="text-blue-800 font-medium">No Locations Found</p>
              <p className="text-blue-600 text-sm mt-1">
                No locations are currently available for selection.
              </p>
            </div>
          ) : (
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
          )}
        </div>
        <Footer
          btnText={submitLoading ? 'Saving...' : 'Save'}
          setError={setError}
          errorMessage={error}
          selectedSites={selectedSites}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
          loading={submitLoading}
        />
      </div>
    </>
  );
};

export default AddLocations;
