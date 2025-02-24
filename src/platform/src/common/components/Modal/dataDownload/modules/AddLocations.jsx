import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DataTable from '../components/DataTable';
import Footer from '../components/Footer';
import LocationCard from '../components/LocationCard';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { fetchSitesSummary } from '@/lib/store/services/sitesSummarySlice';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

/**
 * Header component for the Add Location modal.
 * Includes a back button that opens another modal.
 */
const AddLocationHeader = () => {
  return (
    <h3
      className="flex text-lg leading-6 font-medium text-gray-900"
      id="modal-title"
    >
      Add Location
    </h3>
  );
};

/**
 * Main component for adding locations.
 * Allows users to select sites and updates their preferences accordingly.
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

  const { id: activeGroupId, title: groupTitle } = useGetActiveGroup();

  // Fetch sites summary data using custom hook
  const {
    sitesSummaryData,
    loading,
    error: fetchError,
  } = useSelector((state) => state.sites);

  // filter out sites that are online online_status=online from sitesSummaryData use memo
  const filteredSites = useMemo(() => {
    return (sitesSummaryData || []).filter((site) => site.isOnline === true);
  }, [sitesSummaryData]);

  // Retrieve user ID from localStorage and memoize it
  const userID = useMemo(() => {
    const user = localStorage.getItem('loggedUser');
    return user ? JSON.parse(user)?._id : null;
  }, []);

  /**
   * Fetch sites summary whenever the selected organization changes.
   */
  useEffect(() => {
    if (groupTitle) {
      dispatch(fetchSitesSummary({ group: groupTitle }));
    }
  }, [dispatch, groupTitle]);

  // Extract selected site IDs from user preferences
  const selectedSiteIds = useMemo(() => {
    const firstPreference = preferencesData?.[0];
    return firstPreference?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);

  /**
   * Populate selectedSites based on selectedSiteIds and fetched filteredSites.
   * Also initializes sidebarSites with the initially selected sites.
   */
  useEffect(() => {
    if (filteredSites && selectedSiteIds.length) {
      const initialSelectedSites = filteredSites.filter((site) =>
        selectedSiteIds.includes(site._id),
      );
      setSelectedSites(initialSelectedSites);
      setSidebarSites(initialSelectedSites);
    }
  }, [filteredSites, selectedSiteIds]);

  /**
   * Clears all selected sites.
   */
  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    // Reset clearSelected flag in the next tick
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  /**
   * Toggles the selection of a site.
   * Adds to selectedSites and sidebarSites if selected.
   * Removes from selectedSites but retains in sidebarSites if unselected.
   */
  const handleToggleSite = useCallback(
    (site) => {
      setSelectedSites((prev) => {
        const isSelected = prev.some((s) => s._id === site._id);
        if (isSelected) {
          // Remove from selectedSites
          return prev.filter((s) => s._id !== site._id);
        } else {
          // Add to selectedSites
          return [...prev, site];
        }
      });

      setSidebarSites((prev) => {
        const alreadyInSidebar = prev.some((s) => s._id === site._id);
        if (!alreadyInSidebar) {
          return [...prev, site];
        }
        return prev;
      });
    },
    [setSelectedSites, setSidebarSites],
  );

  /**
   * Handles the submission of selected sites.
   * Dispatches the replaceUserPreferences action with the formatted payload.
   */
  const handleSubmit = useCallback(() => {
    if (selectedSites.length === 0) {
      setError('No locations selected');
      return;
    }

    if (!userID) {
      setError('User not found');
      return;
    }

    // if the locations are more than 4, show an error message
    if (selectedSites.length > 4) {
      setError('You can select up to 4 locations only');
      return;
    }

    // Start the loading state for submission
    setSubmitLoading(true);

    // Prepare selected_sites by excluding grids, devices, and airqlouds
    const selectedSitesData = selectedSites.map((site) => {
      const { grids, devices, airqlouds, ...rest } = site;
      return rest;
    });

    const payload = {
      user_id: userID,
      group_id: activeGroupId,
      selected_sites: selectedSitesData,
    };

    // Dispatch the Redux action to replace user preferences
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
        setError('Failed to update preferences');
        console.error(err);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  }, [selectedSites, userID, dispatch, onClose]);

  /**
   * Generates the content for the sidebar.
   * Displays only the sites that have been selected at least once.
   * Each card reflects its current selection status.
   */
  const sidebarSitesContent = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LocationCard
              key={index}
              site={{}}
              onToggle={handleToggleSite}
              isLoading={loading}
              isSelected={false}
            />
          ))}
        </div>
      );
    }

    if (sidebarSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations selected
        </div>
      );
    }

    return sidebarSites.map((site) => (
      <LocationCard
        key={site._id}
        site={site}
        onToggle={handleToggleSite}
        isLoading={loading}
        isSelected={selectedSites.some((s) => s._id === site._id)}
      />
    ));
  }, [sidebarSites, selectedSites, handleToggleSite, loading]);

  return (
    <>
      {/* Selected Sites Sidebar */}
      <div className="w-auto h-auto md:w-[280px] md:h-[658px] overflow-y-auto md:border-r relative space-y-3 px-4 pt-5 pb-14">
        {sidebarSitesContent}
      </div>

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-2 md:px-8 pt-6 pb-4 overflow-y-auto">
          <DataTable
            data={filteredSites}
            selectedSites={selectedSites}
            setSelectedSites={setSelectedSites}
            clearSites={clearSelected}
            selectedSiteIds={selectedSiteIds}
            loading={loading}
            onToggleSite={handleToggleSite}
          />
          {fetchError && (
            <p className="text-red-600 py-4 px-1 text-sm">
              Error fetching data: {fetchError.message}
            </p>
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

export { AddLocationHeader };
export default AddLocations;
