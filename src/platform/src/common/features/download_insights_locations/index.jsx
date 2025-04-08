'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Close from '@/icons/close_icon';
import PropTypes from 'prop-types';
import DataDownload, { DownloadDataHeader } from './modules/DataDownload';
import AddLocations, { AddLocationHeader } from './modules/AddLocations';
import MoreInsights, { InSightsHeader } from './modules/MoreInsights';
import PlantTree, { AddPlantTreeHeader } from './modules/PlantTree';
import BuyDevice, { AddBuyDeviceHeader } from './modules/BuyDevice';
import Search, { AddSearchHeader } from './modules/Search';
import SelectMore, { SelectMoreHeader } from './modules/SelectMore';

// Modal configuration mapping
const MODAL_CONFIGURATIONS = {
  download: { header: DownloadDataHeader, body: DataDownload },
  addLocation: { header: AddLocationHeader, body: AddLocations },
  inSights: { header: InSightsHeader, body: MoreInsights },
  moreSights: { header: SelectMoreHeader, body: SelectMore },
  plant_tree: { header: AddPlantTreeHeader, body: PlantTree },
  buy_device: { header: AddBuyDeviceHeader, body: BuyDevice },
  search: { header: AddSearchHeader, body: Search },
};

/**
 * Enhanced Modal component with consistent layout and animations
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 */
const Modal = ({ isOpen, onClose }) => {
  const modalType = useSelector((state) => state.modal.modalType.type);
  const ModalHeader =
    MODAL_CONFIGURATIONS[modalType]?.header ||
    (() => <div className="text-lg font-medium">Modal</div>);
  const ModalBody =
    MODAL_CONFIGURATIONS[modalType]?.body ||
    (() => <div>No content available</div>);

  const modalAnimationConfig = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <motion.div
            {...modalAnimationConfig}
            className="w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden transform relative mx-2 lg:mx-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-gray-300">
              <ModalHeader />
              <button
                type="button"
                onClick={onClose}
                className="focus:outline-none hover:bg-gray-100 p-1 rounded-full transition-colors duration-150"
                aria-label="Close Modal"
              >
                <Close fill="#000" />
                <span className="sr-only">Close Modal</span>
              </button>
            </div>

            {/* Body */}
            <div className="relative overflow-y-auto">
              <ModalBody onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
