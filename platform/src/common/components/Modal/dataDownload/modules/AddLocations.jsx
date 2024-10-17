import React, { useState, useCallback, useMemo, useEffect } from 'react';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import DataTable from '../components/DataTable';
import Footer from '../components/Footer';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import LocationCard from '../components/LocationCard';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import useSitesSummary from '@/core/hooks/useSitesSummary';

const AddLocationHeader = () => {
  const dispatch = useDispatch();
  const handleOpenModal = useCallback(() => {
    dispatch(setOpenModal(true));
    dispatch(setModalType({ type: 'location', ids: [] }));
  }, [dispatch]);

  return (
    <h3
      className="flex text-lg leading-6 font-medium text-gray-900"
      id="modal-title"
    >
      <button type="button" onClick={handleOpenModal}>
        <LongArrowLeft className="mr-2" />
      </button>
      Add Location
    </h3>
  );
};

const AddLocations = ({ onClose }) => {
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');
  const { sitesSummaryData, loading, error: fetchError } = useSitesSummary();

  // Extract selected site IDs from preferencesData
  const selectedSiteIds = useMemo(() => {
    if (preferencesData[0]?.selected_sites?.length) {
      return preferencesData[0].selected_sites.map((site) => site._id);
    }
    return [];
  }, [preferencesData]);

  // Populate `selectedSites` based on `selectedSiteIds`
  useEffect(() => {
    if (sitesSummaryData && selectedSiteIds.length) {
      const initialSelectedSites = sitesSummaryData.filter((site) =>
        selectedSiteIds.includes(site._id),
      );
      setSelectedSites(initialSelectedSites || []);
    }
  }, [sitesSummaryData, selectedSiteIds]);

  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  const handleToggleSite = useCallback(
    (site) => {
      setSelectedSites((prev) => {
        const isSelected = prev.some((s) => s._id === site._id);
        return isSelected
          ? prev.filter((s) => s._id !== site._id)
          : [...prev, site];
      });
    },
    [setSelectedSites],
  );

  const handleSubmit = useCallback(() => {
    if (selectedSites.length === 0) {
      setError('No locations selected');
    } else {
      console.info('Selected Sites:', selectedSites); // Submit selected sites
    }
  }, [selectedSites]);

  const selectedSitesContent = useMemo(() => {
    if (!loading && selectedSites?.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations selected
        </div>
      );
    }

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

    return selectedSites?.map((site) => (
      <LocationCard
        key={site._id}
        site={site}
        onToggle={handleToggleSite}
        isLoading={loading}
        isSelected={true}
      />
    ));
  }, [selectedSites, handleToggleSite, loading]);

  return (
    <>
      <div className="w-[280px] h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
      </div>
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
          btnText="Done"
          setError={setError}
          errorMessage={error}
          selectedSites={selectedSites}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
        />
      </div>
    </>
  );
};

export { AddLocationHeader };
export default AddLocations;
