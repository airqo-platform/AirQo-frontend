import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { IoIosMenu } from 'react-icons/io';
import { useAddLocationsData } from './hooks/useAddLocationsData';
import { useFooterInfo } from './hooks/useFooterInfo';
import { useLocationSelection } from './hooks/useLocationSelection';
import { useChecklistSteps } from '@/features/Checklist/hooks/useChecklistSteps';
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import {
  setChartSites,
  setRefreshChart,
} from '@/lib/store/services/charts/ChartSlice';
import ErrorBoundary from '@/components/ErrorBoundary';
import EnhancedFooter from '../components/Footer';
import { SidebarContent } from './components/SidebarContent';
import { MainContent } from './components/MainContent';
import { MobileSidebar } from './components/MobileSidebar';
import { pageVariants, sidebarVariants } from './animations';
import { MAX_LOCATIONS, MESSAGE_TYPES } from './constants';

export const AddLocations = ({ onClose }) => {
  const dispatch = useDispatch();
  const { completeStep } = useChecklistSteps();
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isMobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  const {
    activeGroupId,
    userID,
    selectedSiteIds,
    filteredSites,
    isLoading,
    isError,
    error,
  } = useAddLocationsData();

  const {
    selectedSites,
    setSelectedSites,
    sidebarSites,
    clearSelected,
    error: selectionError,
    setError,
    handleClearSelection,
    handleToggleSite,
  } = useLocationSelection(filteredSites, selectedSiteIds);

  const footerInfo = useFooterInfo({
    selectionError,
    statusMessage,
    messageType,
    selectedSites,
  });

  const handleSubmit = useCallback(() => {
    if (!selectedSites.length) {
      setError('Please select at least one location to save.');
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }
    if (!userID) {
      setError('User not found.');
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }
    if (selectedSites.length > MAX_LOCATIONS) {
      setError(`You can select up to ${MAX_LOCATIONS} locations only.`);
      setMessageType(MESSAGE_TYPES.ERROR);
      return;
    }

    setSubmitLoading(true);
    setStatusMessage('Saving your preferences...');
    setMessageType(MESSAGE_TYPES.INFO);

    const payload = {
      user_id: userID,
      group_id: activeGroupId,
      selected_sites: selectedSites.map(({ ...rest }) => rest),
    };

    Promise.resolve(dispatch(replaceUserPreferences(payload)))
      .then(() => {
        onClose();
        if (userID) {
          dispatch(
            getIndividualUserPreferences({
              identifier: userID,
              groupID: activeGroupId,
            }),
          );
        }
        const ids = payload.selected_sites.map((s) => s._id).filter(Boolean);
        if (ids.length) dispatch(setChartSites(ids));
        dispatch(setRefreshChart(true));
        completeStep(1);
      })
      .catch(() => {
        setError('Failed to update preferences.');
        setMessageType(MESSAGE_TYPES.ERROR);
      })
      .finally(() => {
        setSubmitLoading(false);
        setStatusMessage('');
      });
  }, [
    selectedSites,
    userID,
    activeGroupId,
    dispatch,
    onClose,
    setError,
    completeStep,
  ]);

  const sidebarProps = {
    loading: isLoading,
    filteredSites,
    sidebarSites,
    handleToggleSite,
    selectedSites,
  };

  return (
    <ErrorBoundary name="AddLocation" feature="Add Locations">
      <motion.div
        className="relative flex flex-col lg:flex-row h-full min-h-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-testid="add-locations-container"
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
            btnText={submitLoading ? 'Saving...' : 'Save'}
            setError={setError}
            message={footerInfo.message}
            messageType={footerInfo.type}
            selectedItems={selectedSites}
            handleClearSelection={
              selectedSites.length > 0 ? handleClearSelection : undefined
            }
            handleSubmit={handleSubmit}
            onClose={onClose}
            loading={submitLoading}
            disabled={submitLoading || selectedSites.length === 0}
            minimumSelection={0}
          />
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};
