'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { Transition, TransitionChild } from '@headlessui/react';
import Close from '@/icons/close_icon';
import PropTypes from 'prop-types';
import DataDownload, { DownloadDataHeader } from './modules/DataDownload';
import AddLocations, { AddLocationHeader } from './modules/AddLocations';
import MoreInsights, { InSightsHeader } from './modules/MoreInsights';

const Modal = ({ isOpen, onClose }) => {
  const modalType = useSelector((state) => state.modal.modalType.type);

  const renderHeader = () => {
    switch (modalType) {
      case 'download':
        return <DownloadDataHeader />;
      case 'addLocation':
        return <AddLocationHeader />;
      case 'location':
        return <InSightsHeader />;
      default:
    }
  };

  const renderBody = () => {
    switch (modalType) {
      case 'download':
        return <DataDownload onClose={onClose} />;
      case 'addLocation':
        return <AddLocations onClose={onClose} />;
      case 'location':
        return <MoreInsights />;
      default:
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div className="fixed inset-0 z-50  min-h-screen flex items-center justify-center overflow-y-auto">
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
          <div className="inline-bloc relative align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle lg:min-h-[658px] lg:min-w-[1020px] max-w-[1020px] h-auto ">
            {/* header */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-[#E2E3E5]">
              {renderHeader()}
              <div>
                <button type="button" onClick={onClose}>
                  <Close fill="#000" />
                  <span className="sr-only">Close Modal</span>
                </button>
              </div>
            </div>
            {/* body */}
            <div className="flex relative flex-grow">{renderBody()}</div>
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
