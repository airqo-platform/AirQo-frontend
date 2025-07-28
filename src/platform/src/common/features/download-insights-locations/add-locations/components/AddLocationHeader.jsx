// AddLocationHeader component
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';

import { setModalType } from '@/lib/store/services/downloadModal';

const AddLocationHeader = () => {
  const dispatch = useDispatch();
  const fromMoreInsights = useSelector(
    (state) => state.modal.modalType?.fromMoreInsights,
  );
  const handleBack = () => {
    dispatch(setModalType({ type: 'inSights', fromMoreInsights: false }));
  };
  return (
    <div className="flex items-center">
      {fromMoreInsights ? (
        <button
          onClick={handleBack}
          aria-label="Back to More Insights"
          className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <IoIosArrowBack size={22} />
        </button>
      ) : null}
      <h3
        className="flex text-lg leading-6 font-medium dark:text-white"
        id="modal-title"
      >
        Add Location
      </h3>
    </div>
  );
};

export default AddLocationHeader;
