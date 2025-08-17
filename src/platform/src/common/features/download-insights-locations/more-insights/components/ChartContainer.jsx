import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from '@/features/airQuality-charts/ChartContainer/components/SkeletonLoader';
import MoreInsightsChart from '@/features/airQuality-charts/MoreInsightsChart';
import InfoMessage from '@/components/Messages/InfoMessage';
import { MdErrorOutline } from 'react-icons/md';

const variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

function ChartContainer({
  allSiteData,
  chartLoading,
  isError,
  error,
  isValidating,
  dataLoadingSites,
  visibleSites,
  chartType,
  frequency,
  pollutantType,
  handleManualRefresh,
  isManualRefresh,
  refreshSuccess,
}) {
  const render = () => {
    if (isError)
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <MdErrorOutline className="text-red-500 text-4xl" />
          <h3 className="text-red-800 text-lg font-semibold">
            Oops! Something went wrong.
          </h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">
            {error.message.includes('canceled')
              ? 'Request was canceled.'
              : error.message}
          </p>
          <button
            onClick={handleManualRefresh}
            disabled={isValidating}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {isValidating ? 'Refreshing...' : 'Try Again'}
          </button>
        </div>
      );

    if (
      chartLoading ||
      (isValidating && dataLoadingSites.length && !allSiteData.length)
    )
      return <SkeletonLoader width="100%" height={380} />;

    if (allSiteData.length)
      return (
        <div className="h-[350px] sm:h-[400px] w-full">
          <MoreInsightsChart
            data={allSiteData}
            selectedSites={dataLoadingSites}
            visibleSiteIds={visibleSites}
            chartType={chartType}
            frequency={frequency}
            width="100%"
            height="100%"
            id="air-quality-chart"
            pollutantType={pollutantType}
            refreshChart={handleManualRefresh}
            isRefreshing={isValidating && isManualRefresh}
          />
        </div>
      );

    return (
      <InfoMessage
        title="Chart Unavailable"
        description="We couldn't display insights for your current selections. Please try again or adjust your filters."
        variant="info"
        className="h-96 flex items-center justify-center"
      >
        <button
          onClick={handleManualRefresh}
          disabled={isValidating}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {isValidating ? 'Refreshing...' : 'Retry'}
        </button>
      </InfoMessage>
    );
  };

  return (
    <motion.div
      variants={variants}
      className="relative border dark:border-gray-700 rounded-xl p-2 h-[360px] sm:h-[410px] flex-shrink-0 dark:bg-gray-800"
    >
      <AnimatePresence>
        {refreshSuccess && !isValidating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm"
          >
            <span className="text-sm font-medium ml-1">Data refreshed</span>
          </motion.div>
        )}
      </AnimatePresence>
      {render()}
    </motion.div>
  );
}

export default memo(ChartContainer);
