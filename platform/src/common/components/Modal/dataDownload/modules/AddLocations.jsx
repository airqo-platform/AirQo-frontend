import React, { useState, useCallback, useMemo, useEffect } from 'react';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import DataTable from '../components/DataTable';
import Footer from '../components/Footer';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import LocationCard from '../components/LocationCard';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import useSitesSummary from '@/core/hooks/useSitesSummary';

const AddLocationHeader = () => {
  const dispatch = useDispatch();
  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  return (
    <h3
      className="flex text-lg leading-6 font-medium text-gray-900"
      id="modal-title"
    >
      <button type="button" onClick={() => handleOpenModal('location')}>
        <LongArrowLeft className="mr-2" />
      </button>
      Add Location
    </h3>
  );
};

const AddLocations = ({ onClose }) => {
  const selectedSiteIds = [
    '654b50a8c4e34500135a6691',
    '6549f515f59f69001325b935',
    '6549f3f721bac300137ab49e',
  ];
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');
  const { sitesSummaryData, loading, error: fetchError } = useSitesSummary();

  // Populate `selectedSites` based on `selectedSiteIds`
  useEffect(() => {
    const initialSelectedSites = sitesSummaryData?.filter((site) =>
      selectedSiteIds.includes(String(site._id)),
    );
    setSelectedSites(initialSelectedSites);
  }, []);

  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  const handleToggleSite = useCallback(
    (site) => {
      setSelectedSites((prev) => {
        const isSelected = prev.some((s) => s._id === site._id);
        if (isSelected) {
          return prev.filter((s) => s._id !== site._id);
        } else {
          return [...prev, site];
        }
      });
    },
    [setSelectedSites],
  );

  const handleSubmit = useCallback(() => {
    // Implement submission logic
  }, []);

  const selectedSitesContent = useMemo(() => {
    if (selectedSites?.length === 0 && !loading) {
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
        <LocationCard
          site={{}}
          onToggle={handleToggleSite}
          isLoading={loading}
          isSelected={false}
        />
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
