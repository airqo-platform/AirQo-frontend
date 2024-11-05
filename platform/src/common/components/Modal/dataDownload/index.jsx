import React from 'react';
import { useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import Close from '@/icons/close_icon';
import PropTypes from 'prop-types';
import DataDownload, { DownloadDataHeader } from './modules/DataDownload';
import AddLocations, { AddLocationHeader } from './modules/AddLocations';
import MoreInsights, { InSightsHeader } from './modules/MoreInsights';
import PlantTree, { AddPlantTreeHeader } from './modules/PlantTree';
import BuyDevice, { AddBuyDeviceHeader } from './modules/BuyDevice';
import Search, { AddSearchHeader } from './modules/Search';
import SelectMore, { SelectMoreHeader } from './modules/SelectMore';

const Modal = ({ isOpen, onClose }) => {
  const modalType = useSelector((state) => state.modal.modalType.type);

  /**
   * Renders the appropriate header based on the modal type.
   */
  const renderHeader = () => {
    switch (modalType) {
      case 'download':
        return <DownloadDataHeader />;
      case 'addLocation':
        return <AddLocationHeader />;
      case 'inSights':
        return <InSightsHeader />;
      case 'moreSights':
        return <SelectMoreHeader />;
      case 'plant_tree':
        return <AddPlantTreeHeader />;
      case 'buy_device':
        return <AddBuyDeviceHeader />;
      case 'search':
        return <AddSearchHeader />;
      default:
        return null; // Provide a fallback
    }
  };

  /**
   * Renders the appropriate body content based on the modal type.
   */
  const renderBody = () => {
    switch (modalType) {
      case 'download':
        return <DataDownload onClose={onClose} />;
      case 'addLocation':
        return <AddLocations onClose={onClose} />;
      case 'inSights':
        return <MoreInsights />;
      case 'moreSights':
        return <SelectMore onClose={onClose} />;
      case 'plant_tree':
        return <PlantTree onClose={onClose} />;
      case 'buy_device':
        return <BuyDevice onClose={onClose} />;
      case 'search':
        return <Search onClose={onClose} />;
      default:
        return <div className="p-4">Invalid Modal Type</div>;
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Background Overlay */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-75"
          leave="ease-in duration-200"
          leaveFrom="opacity-75"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 transition-opacity"></div>
        </Transition.Child>

        {/* Modal Panel */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            className="relative bg-white rounded-lg shadow-xl transform transition-all sm:max-w-4xl w-full max-h-screen flex flex-col"
            style={{ maxWidth: '1020px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 rounded-t-xl border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>{renderHeader()}</div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close Modal"
              >
                <Close fill="#000" />
              </button>
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-y-auto flex flex-col lg:flex-row">
              {renderBody()}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
