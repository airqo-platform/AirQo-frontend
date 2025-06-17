import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DataTable from '../components/DataTable';
import Footer from '../components/Footer';
import LocationCard from '../components/LocationCard';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

/**
 * Header component for the Add Location modal.
 * Includes a back button that opens another modal.
 */
const SelectMoreHeader = () => {
  const dispatch = useDispatch();

  const handleOpenModal = useCallback(() => {
    dispatch(setOpenModal(true));
    dispatch(setModalType({ type: 'inSights' }));
  }, [dispatch]);

  return (
    <h3
      className="flex text-lg leading-6 font-medium text-gray-900"
      id="modal-title"
    >
      <button type="button" onClick={handleOpenModal}>
        <LongArrowLeft className="mr-2" />
      </button>
      More insights {'>'} Add Location
    </h3>
  );
};

/**
 * Main component for adding locations.
 * Allows users to select sites and updates their preferences accordingly.
 */
const SelectMore = ({ onClose }) => {
  const dispatch = useDispatch();

  // Retrieve user preferences from Redux store
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  // Local state management
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  // Fetch sites summary data using custom hook
  const {
    sitesSummaryData,
    loading,
    error: fetchError,
  } = useSelector((state) => state.sites);
  // Get user ID from useGetActiveGroup hook
  const { userID } = useGetActiveGroup();

  // Extract selected site IDs from user preferences
  const selectedSiteIds = useMemo(() => {
    const firstPreference = preferencesData?.[0];
    return firstPreference?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);

  /**
   * Populate selectedSites based on selectedSiteIds and fetched sitesSummaryData.
   */
  useEffect(() => {
    if (sitesSummaryData && selectedSiteIds.length) {
      const initialSelectedSites = sitesSummaryData.filter((site) =>
        selectedSiteIds.includes(site._id),
      );
      setSelectedSites(initialSelectedSites);
    }
  }, [sitesSummaryData, selectedSiteIds]);

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
   * @param {Object} site - The site to toggle.
   */
  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);
      return isSelected
        ? prev.filter((s) => s._id !== site._id)
        : [...prev, site];
    });
  }, []);

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

    const selectedSitesData = selectedSites.map((site) => {
      const { grids, devices, airqlouds, ...rest } = site;
      return rest;
    });

    handleOpenModal('inSights', null, selectedSitesData);
  }, [selectedSites, userID, dispatch, onClose]);

  /**
   * Generates the content for the selected sites panel.
   */
  const selectedSitesContent = useMemo(() => {
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

    if (selectedSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations selected
        </div>
      );
    }

    return selectedSites.map((site) => (
      <LocationCard
        key={site._id}
        site={site}
        onToggle={handleToggleSite}
        isLoading={loading}
        isSelected={true}
      />
    ));
  }, [selectedSites, handleToggleSite, loading]);

  const handleOpenModal = useCallback(
    (type, ids = null, data = null) => {
      dispatch(setModalType({ type, ids, data }));
    },
    [dispatch],
  );

  return (
    <>
      {/* Selected Sites Sidebar */}
      <div className="w-[240px] h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
      </div>

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-8 pt-6 pb-4 overflow-y-auto">
          <DataTable
            data={sitesSummaryData}
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
          btnText={'Save'}
          setError={setError}
          errorMessage={error}
          selectedSites={selectedSites}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
          loading={false}
        />
      </div>
    </>
  );
};

export { SelectMoreHeader };
export default SelectMore;
