import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { tableData } from '../constants';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import DataTable from '../components/DataTable';
import Footer from '../components/Footer';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import LocationCard from '../components/LocationCard';

const AddLocationHeader = ({ onBack }) => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    <button type="button" onClick={onBack}>
      <LongArrowLeft className="mr-2" />
    </button>
    Add Location
  </h3>
);

AddLocationHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
};

const AddLocations = ({ onClose }) => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s.id === site.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== site.id);
      } else {
        return [...prev, site];
      }
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // implementation for submit logic
  }, []);

  const selectedSitesContent = useMemo(() => {
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
      <LocationCard key={site.id} site={site} onToggle={handleToggleSite} />
    ));
  }, [selectedSites, handleToggleSite]);

  return (
    <>
      <div className="w-[280px] h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
      </div>
      <div className="bg-white relative w-full h-auto">
        <div className="px-8 pt-6 pb-4 overflow-y-auto">
          <DataTable
            data={tableData}
            selectedSites={selectedSites}
            setSelectedSites={setSelectedSites}
            clearSites={clearSelected}
          />
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

AddLocations.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export { AddLocationHeader };
export default AddLocations;
