import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Footer from '../components/Footer';

const AddSearchHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Search for locations
  </h3>
);

const Search = ({ onClose }) => {
  const handleClearSelection = useCallback(() => {}, []);

  const handleSubmit = useCallback(() => {
    // implementation for submit logic
  }, []);

  return (
    <>
      <div className="w-full h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        <Footer
          btnText="Done"
          setError={null}
          errorMessage={null}
          selectedSites={null}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
        />
      </div>
    </>
  );
};

Search.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export { AddSearchHeader };
export default Search;
