'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { Transition, TransitionChild } from '@headlessui/react';
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
    }
  };

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
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
        </TransitionChild>

        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div className="w-full max-w-[1020px] max-h-[90vh] bg-white rounded-lg shadow-xl overflow-y-auto xl:overflow-hidden transform transition-all mx-2 lg:mx-0">
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-gray-300">
              {renderHeader()}
              <button
                type="button"
                onClick={onClose}
                className="focus:outline-none"
              >
                <Close fill="#000" />
                <span className="sr-only">Close Modal</span>
              </button>
            </div>
            {/* Body */}
            <div className="relative flex flex-col md:flex-row">
              {renderBody()}
            </div>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Modal;
