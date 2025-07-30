import React from 'react';
import { useDispatch } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';
import { setModalType } from '@/lib/store/services/downloadModal';
import { cancelTempSelections } from '@/lib/store/services/moreInsights';

const AddLocationsForMoreInsightsHeader = () => {
  const dispatch = useDispatch();

  const handleBack = () => {
    // Cancel temp selections and go back to More Insights
    dispatch(cancelTempSelections());
    dispatch(setModalType({ type: 'inSights', fromMoreInsights: false }));
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleBack}
        aria-label="Back to More Insights"
        className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <IoIosArrowBack size={22} />
      </button>
      <h3
        className="flex text-lg leading-6 font-medium dark:text-white"
        id="modal-title"
      >
        Add Locations for Analysis
      </h3>
    </div>
  );
};

export default AddLocationsForMoreInsightsHeader;
