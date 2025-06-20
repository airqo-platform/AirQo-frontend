'use client';
import React, { useCallback, useEffect, useMemo } from 'react';
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
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import './styles/modal-responsive.css';

const MODAL_CONFIGURATIONS = {
  download: { header: DownloadDataHeader, body: DataDownload },
  addLocation: { header: AddLocationHeader, body: AddLocations },
  inSights: { header: InSightsHeader, body: MoreInsights },
  moreSights: { header: SelectMoreHeader, body: SelectMore },
  plant_tree: { header: AddPlantTreeHeader, body: PlantTree },
  buy_device: { header: AddBuyDeviceHeader, body: BuyDevice },
  search: { header: AddSearchHeader, body: Search },
};

const Modal = ({ isOpen, onClose }) => {
  const modalType = useSelector((state) => state.modal.modalType?.type);
  const { theme, systemTheme } = useTheme();
  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  const ModalHeader =
    MODAL_CONFIGURATIONS[modalType]?.header ||
    (() => <div className="text-lg font-medium dark:text-white">Modal</div>);

  const ModalBody =
    MODAL_CONFIGURATIONS[modalType]?.body ||
    (() => <div className="dark:text-white">No content available</div>);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const modalAnimationConfig = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/80 transition-opacity duration-200"
            onClick={onClose}
            aria-label="Close organization selection modal"
          />
          <motion.div
            {...modalAnimationConfig}
            className="modal-container w-full max-w-6xl bg-white dark:bg-[#1d1f20] rounded-lg shadow-xl overflow-hidden transform relative 
                       h-[85vh] max-h-[800px] min-h-[500px]
                       flex flex-col"
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-5 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
              <ModalHeader />
              <button
                type="button"
                onClick={onClose}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors duration-150"
                aria-label="Close Modal"
              >
                <Close fill={`${isDarkMode ? '#fff' : '#000'}`} />
                <span className="sr-only">Close Modal</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="modal-content flex-1 overflow-hidden dark:text-white">
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
