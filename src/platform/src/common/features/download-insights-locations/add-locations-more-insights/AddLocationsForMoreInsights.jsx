import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { IoIosMenu } from 'react-icons/io';
import { useAddLocationsData } from '../add-locations/hooks/useAddLocationsData';
import { useLocationSelectionForMoreInsights } from './hooks/useLocationSelectionForMoreInsights';
import { useFooterInfo } from '../add-locations/hooks/useFooterInfo';
import {
  applyTempSelections,
  cancelTempSelections,
  setIsAddingLocations,
  selectTempSelectedSites,
} from '@/lib/store/services/moreInsights';
import { setModalType } from '@/lib/store/services/downloadModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import EnhancedFooter from '../components/Footer';
import { SidebarContent } from '../add-locations/components/SidebarContent';
import { MainContent } from '../add-locations/components/MainContent';
import { MobileSidebar } from '../add-locations/components/MobileSidebar';
import { pageVariants, sidebarVariants } from '../add-locations/animations';
import { MESSAGE_TYPES } from '../add-locations/constants';

export const AddLocationsForMoreInsights = ({ onClose }) => {
  const dispatch = useDispatch();
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isMobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  // Get current More Insights selected sites
  const currentMoreInsightsSites = useSelector(selectTempSelectedSites);
  const moreInsightsSites = useSelector(
    (state) => state.moreInsights.selectedSites,
  );

  // Use temp sites if available, otherwise use main selected sites
  const initialSites =
    currentMoreInsightsSites.length > 0
      ? currentMoreInsightsSites
      : moreInsightsSites;

  const { filteredSites, isLoading, isError, error } = useAddLocationsData();

  const {
    selectedSites,
    setSelectedSites,
    sidebarSites,
    clearSelected,
    error: selectionError,
    setError,
    handleClearSelection,
    handleToggleSite,
  } = useLocationSelectionForMoreInsights(filteredSites, initialSites);

  const footerInfo = useFooterInfo({
    selectionError,
    statusMessage,
    messageType,
    selectedSites,
  });

  // Initialize the adding locations state when component mounts
  useEffect(() => {
    dispatch(setIsAddingLocations(true));
    return () => {
      // Cleanup: Cancel temp selections if component unmounts without saving
      dispatch(cancelTempSelections());
    };
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    if (!selectedSites.length) {
      setError('Please select at least one location to analyze.');
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }

    setSubmitLoading(true);
    setStatusMessage('Updating your analysis locations...');
    setMessageType(MESSAGE_TYPES.INFO);

    try {
      // Apply the temporary selections to the More Insights state
      dispatch(applyTempSelections());

      // Navigate back to More Insights view
      dispatch(
        setModalType({
          type: 'inSights',
          data: selectedSites,
          fromMoreInsights: false,
        }),
      );
      // Do NOT close the modal here; let modal system switch view
    } catch {
      setError('Failed to update analysis locations.');
      setMessageType(MESSAGE_TYPES.ERROR);
    } finally {
      setSubmitLoading(false);
      setStatusMessage('');
    }
  }, [selectedSites, dispatch, setError]);

  const handleCancel = useCallback(() => {
    // Cancel temporary selections and go back to More Insights
    dispatch(cancelTempSelections());
    dispatch(
      setModalType({
        type: 'inSights',
        fromMoreInsights: false,
      }),
    );
    onClose();
  }, [dispatch, onClose]);

  const sidebarProps = {
    loading: isLoading,
    filteredSites,
    sidebarSites,
    handleToggleSite,
    selectedSites,
  };

  return (
    <ErrorBoundary
      name="AddLocationsForMoreInsights"
      feature="Add Locations for Analysis"
    >
      <motion.div
        className="relative flex flex-col lg:flex-row h-full min-h-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-testid="add-locations-more-insights-container"
      >
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <motion.div
            className="w-[240px] h-full overflow-y-auto overflow-x-hidden border-r border-gray-200 dark:border-gray-700 relative space-y-3 px-4 pt-5 pb-14"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            <SidebarContent {...sidebarProps} />
          </motion.div>
        </div>

        {/* Mobile/Tablet Menu Button */}
        <div className="lg:hidden px-4 md:px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setMobileSidebarVisible(true)}
            aria-label="Open sidebar menu"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <IoIosMenu size={24} />
          </button>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isVisible={isMobileSidebarVisible}
          close={() => setMobileSidebarVisible(false)}
          {...sidebarProps}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <motion.div
            className="flex-1 px-2 sm:px-6 pt-6 pb-4 overflow-y-auto overflow-x-hidden"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            <MainContent
              filteredSites={filteredSites}
              selectedSites={selectedSites}
              setSelectedSites={setSelectedSites}
              clearSelected={clearSelected}
              loading={isLoading}
              isError={isError}
              fetchError={error}
              handleToggleSite={handleToggleSite}
            />
          </motion.div>

          <EnhancedFooter
            btnText={submitLoading ? 'Updating...' : 'Update Analysis'}
            setError={setError}
            message={footerInfo.message}
            messageType={footerInfo.type}
            selectedItems={selectedSites}
            handleClearSelection={
              selectedSites.length > 1 ? handleClearSelection : undefined
            }
            handleSubmit={handleSubmit}
            onClose={handleCancel}
            loading={submitLoading}
            disabled={submitLoading || selectedSites.length === 0}
            minimumSelection={1}
          />
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};
