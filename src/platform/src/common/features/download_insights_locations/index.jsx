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

/**
 * Enhanced Modal component with consistent layout and animations
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 */
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
        return <div className="text-lg font-medium">Modal</div>;
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
        return <div>No content available</div>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <motion.div
            className="w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden transform relative mx-2 lg:mx-0"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
              },
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.98,
              transition: {
                duration: 0.2,
              },
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-gray-300">
              {renderHeader()}
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
            <div className="relative overflow-y-auto">{renderBody()}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Modal;
