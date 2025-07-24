'use client';
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import ErrorBoundary from '@/components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import ControlsBar from './components/ControlsBar';
import ChartContainer from './components/ChartContainer';
import HiddenSitesInfo from './components/HiddenSitesInfo';
import useMoreInsights from './hooks/useMoreInsights';
import useDownload from './hooks/useDownload';
import { IoIosMenu } from 'react-icons/io';
import Close from '@/icons/close_icon';

import AirQualityCard from '@/features/download-insights-locations/components/AirQualityCard';
import SelectionMessage from '@/features/download-insights-locations/components/SelectionMessage';

const variants = {
  content: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  },
  sidebar: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.07 },
    },
  },
  item: { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } },
};

import { useSelector, useDispatch } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';
import { setModalType } from '@/lib/store/services/downloadModal';

export const InSightsHeader = () => {
  const dispatch = useDispatch();
  const backToDownload = useSelector(
    (state) => state.modal.modalType?.backToDownload,
  );

  const handleBack = () => {
    dispatch(
      setModalType({
        type: 'download',
        ids: [],
        data: [],
        backToDownload: false,
      }),
    );
  };

  return (
    <div className="flex items-center">
      {backToDownload && (
        <button
          onClick={handleBack}
          aria-label="Back to Data Download"
          className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <IoIosArrowBack size={22} />
        </button>
      )}
      <h3
        className="flex text-lg leading-6 font-medium dark:text-white"
        id="modal-title"
      >
        More Insights
      </h3>
    </div>
  );
};

function MoreInsights() {
  const {
    allSites,
    allSiteData,
    chartLoading,
    isError,
    error,
    isValidating,
    dataLoadingSites,
    visibleSites,
    mobileSidebarVisible,
    setMobileSidebarVisible,
    frequency,
    setFrequency,
    chartType,
    setChartType,
    dateRange,
    setDateRange,
    isManualRefresh,
    refreshSuccess,
    handleSiteAction,
    handleManualRefresh,
    pollutant,
  } = useMoreInsights();

  const {
    download,
    loading: downloadLoading,
    error: downloadError,
  } = useDownload({
    visibleSites,
    allSites,
    dateRange,
    pollutant,
    frequency,
  });

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <ErrorBoundary name="MoreInsights" feature="Air Quality Insights">
      <motion.div
        className="relative flex flex-col lg:flex-row h-full min-h-0 bg-transparent"
        variants={variants.content}
        initial="initial"
        animate="animate"
      >
        {/* desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <motion.div
            className="w-[240px] h-full overflow-y-auto overflow-x-hidden border-r border-gray-200 dark:border-gray-700"
            variants={variants.sidebar}
          >
            <Sidebar
              allSites={allSites}
              visibleSites={visibleSites}
              dataLoadingSites={dataLoadingSites}
              isValidating={isValidating}
              handleSiteAction={handleSiteAction}
            />
          </motion.div>
        </div>

        {/* mobile menu */}
        <div className="lg:hidden px-4 pt-2 flex-shrink-0">
          <button
            aria-label="Open sidebar"
            onClick={() => setMobileSidebarVisible(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <IoIosMenu size={24} />
          </button>
        </div>

        {/* mobile overlay */}
        <AnimatePresence>
          {mobileSidebarVisible && (
            <motion.div className="absolute inset-0 z-50 flex h-full">
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-[240px] h-full bg-white dark:bg-[#1d1f20] shadow-lg overflow-y-auto overflow-x-hidden"
              >
                <div className="flex justify-end p-2">
                  <button
                    aria-label="Close sidebar"
                    onClick={() => setMobileSidebarVisible(false)}
                  >
                    <Close />
                  </button>
                </div>
                <Sidebar
                  allSites={allSites}
                  visibleSites={visibleSites}
                  dataLoadingSites={dataLoadingSites}
                  isValidating={isValidating}
                  handleSiteAction={handleSiteAction}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="px-4 sm:px-6 py-4 flex flex-col space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
            <ControlsBar
              frequency={frequency}
              setFrequency={setFrequency}
              chartType={chartType}
              setChartType={setChartType}
              dateRange={dateRange}
              setDateRange={setDateRange}
              handleManualRefresh={handleManualRefresh}
              isValidating={isValidating}
              download={download}
              downloadLoading={downloadLoading}
              visibleSites={visibleSites}
              isMobile={isMobile}
            />

            {downloadError && (
              <SelectionMessage type="error">{downloadError}</SelectionMessage>
            )}

            <ChartContainer
              allSiteData={allSiteData}
              chartLoading={chartLoading}
              isError={isError}
              error={error}
              isValidating={isValidating}
              dataLoadingSites={dataLoadingSites}
              visibleSites={visibleSites}
              chartType={chartType}
              frequency={frequency}
              pollutantType={pollutant}
              handleManualRefresh={handleManualRefresh}
              isManualRefresh={isManualRefresh}
              refreshSuccess={refreshSuccess}
            />

            <HiddenSitesInfo
              hiddenCount={dataLoadingSites.length - visibleSites.length}
            />

            <motion.div variants={variants.item} className="flex-shrink-0">
              <AirQualityCard
                airQuality="--"
                pollutionSource="--"
                pollutant={pollutant === 'pm2_5' ? 'PM2.5' : 'PM10'}
                isLoading={chartLoading || isValidating}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}

export default memo(MoreInsights);
