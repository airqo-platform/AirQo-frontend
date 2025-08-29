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
import {
  AqXClose,
  AqMenu01,
  AqGlobe02,
  AqBuilding02,
  AqMarkerPin01,
  AqCpuChip01,
  AqArrowNarrowLeft,
  AqBarChart07,
} from '@airqo/icons-react';

import AirQualityCard from '@/features/download-insights-locations/components/AirQualityCard';
import SelectionMessage from '@/features/download-insights-locations/components/SelectionMessage';
import EmptyState from '@/common/components/EmptyState';

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
import { setModalType } from '@/lib/store/services/downloadModal';

export const InSightsHeader = () => {
  const dispatch = useDispatch();
  const backToDownload = useSelector(
    (state) => state.modal.modalType?.backToDownload,
  );
  const modalTitle = useSelector(
    (state) => state.modal.modalType?.modalTitle || 'Air Quality Insights',
  );
  const filterType = useSelector((state) => state.modal.modalType?.filterType);

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

  // Get appropriate icon based on filter type with proper text formatting
  const getHeaderIcon = () => {
    if (!filterType)
      return <AqBarChart07 size={20} className="text-blue-600" />;

    switch (filterType) {
      case 'countries':
        return <AqGlobe02 size={20} className="text-green-600" />;
      case 'cities':
        return <AqBuilding02 size={20} className="text-orange-600" />;
      case 'devices':
        return <AqCpuChip01 size={20} className="text-purple-600" />;
      case 'sites':
      default:
        return <AqMarkerPin01 size={20} className="text-blue-600" />;
    }
  };

  // Format modal title to remove underscores/hyphens and capitalize properly
  const formatTitle = (title) => {
    if (!title) return 'Air Quality Insights';

    return title
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="flex items-center gap-3">
      {backToDownload && (
        <button
          onClick={handleBack}
          aria-label="Back to Data Download"
          className="mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <AqArrowNarrowLeft
            size={20}
            className="text-gray-600 dark:text-gray-300"
          />
        </button>
      )}
      <div className="flex items-center gap-2">
        {getHeaderIcon()}
        <h3
          className="text-lg leading-6 font-medium dark:text-white"
          id="modal-title"
        >
          {formatTitle(modalTitle)}
        </h3>
      </div>
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

  // Check if we have no data to display
  const hasNoData = !allSites || allSites.length === 0;
  const hasNoVisibleSites = visibleSites.length === 0;

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
            {hasNoData ? (
              <div className="p-4">
                <EmptyState
                  preset="data"
                  size="small"
                  title="No Sites Available"
                  description="No monitoring sites are available for visualization."
                  variant="minimal"
                  showIcon={true}
                />
              </div>
            ) : (
              <Sidebar
                allSites={allSites}
                visibleSites={visibleSites}
                dataLoadingSites={dataLoadingSites}
                isValidating={isValidating}
                handleSiteAction={handleSiteAction}
              />
            )}
          </motion.div>
        </div>

        {/* mobile menu */}
        <div className="lg:hidden px-4 pt-2 flex-shrink-0">
          <button
            aria-label="Open sidebar"
            onClick={() => setMobileSidebarVisible(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <AqMenu01 size={20} className="mr-2" />
            <span>Manage Sites</span>
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
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <AqXClose size={16} />
                  </button>
                </div>
                {hasNoData ? (
                  <div className="p-4">
                    <EmptyState
                      preset="data"
                      size="small"
                      title="No Sites Available"
                      description="No monitoring sites are available for visualization."
                      variant="minimal"
                      showIcon={true}
                    />
                  </div>
                ) : (
                  <Sidebar
                    allSites={allSites}
                    visibleSites={visibleSites}
                    dataLoadingSites={dataLoadingSites}
                    isValidating={isValidating}
                    handleSiteAction={handleSiteAction}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="px-4 sm:px-6 py-4 flex flex-col space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
            {hasNoData ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  preset="data"
                  title="No Data Available"
                  description="There are no monitoring sites available for visualization. Please check back later or contact support if this issue persists."
                  actionLabel="Back to Download"
                  onAction={() =>
                    dispatch(
                      setModalType({
                        type: 'download',
                        ids: [],
                        data: [],
                        backToDownload: false,
                      }),
                    )
                  }
                  variant="card"
                  size="medium"
                />
              </div>
            ) : hasNoVisibleSites ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  preset="search"
                  title="No Sites Selected"
                  description="Please select one or more monitoring sites from the sidebar to view air quality insights and charts."
                  actionLabel="Select Sites"
                  onAction={() => setMobileSidebarVisible(true)}
                  variant="card"
                  size="medium"
                />
              </div>
            ) : (
              <>
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
                  <SelectionMessage type="error">
                    {downloadError}
                  </SelectionMessage>
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
              </>
            )}
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}

export default memo(MoreInsights);
