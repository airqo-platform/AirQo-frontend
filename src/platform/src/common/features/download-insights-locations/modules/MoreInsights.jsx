'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { saveAs } from 'file-saver';
import MoreInsightsChart from '@/features/airQuality-charts/MoreInsightsChart';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';
import useDataDownload from '@/core/hooks/useDataDownload';
import AirQualityCard from '../components/AirQualityCard';
import LocationCard from '../components/LocationCard';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import CustomToast from '@/components/Toast/CustomToast';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import SkeletonLoader from '@/features/airQuality-charts/components/SkeletonLoader';
import { Tooltip } from 'flowbite-react';
import { MdErrorOutline, MdInfo } from 'react-icons/md';
import { DoneRefreshed } from '../constants/svgs';
import InfoMessage from '@/components/Messages/InfoMessage';
import SelectionMessage from '../components/SelectionMessage';
import ErrorBoundary from '@/components/ErrorBoundary';

export const InSightsHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium dark:text-white"
    id="modal-title"
  >
    More Insights
  </h3>
);

const MoreInsights = () => {
  const modalData = useSelector((state) => state.modal.modalType?.data);
  const chartData = useSelector((state) => state.chart);

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [frequency, setFrequency] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const controllersRef = useRef({});
  const fetchData = useDataDownload();

  // Normalize sites data
  const allSites = useMemo(
    () => (Array.isArray(modalData) ? modalData : modalData ? [modalData] : []),
    [modalData],
  );
  const [dataLoadingSites, setDataLoadingSites] = useState(
    allSites.map((s) => s._id),
  );
  const [visibleSites, setVisibleSites] = useState(allSites.map((s) => s._id));

  const initialDateRange = useMemo(() => {
    const { startDateISO, endDateISO } = formatDateRangeToISO(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(),
    );
    return {
      startDate: startDateISO,
      endDate: endDateISO,
      label: 'Last 7 days',
    };
  }, []);
  const [dateRange, setDateRange] = useState(initialDateRange);

  const { allSiteData, chartLoading, isError, error, refetch, isValidating } =
    useAnalyticsData(
      {
        selectedSiteIds: dataLoadingSites,
        dateRange: {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        },
        chartType,
        frequency,
        pollutant: chartData.pollutionType,
        organisationName: chartData.organizationName,
      },
      {
        revalidateOnFocus: false,
        dedupingInterval: 10000,
        errorRetryCount: 2,
        onError: (err) => {
          if (
            err.name === 'AbortError' ||
            err.message?.includes('aborted') ||
            err.message?.includes('canceled')
          )
            return;
          if (isManualRefresh) setIsManualRefresh(false);
        },
        onSuccess: () => {
          if (isManualRefresh) {
            setRefreshSuccess(true);
            setIsManualRefresh(false);
            clearTimeout(controllersRef.current.success);
            controllersRef.current.success = setTimeout(
              () => setRefreshSuccess(false),
              3000,
            );
          }
        },
      },
    );

  useEffect(() => {
    return () => {
      Object.values(controllersRef.current).forEach((ctrl) =>
        ctrl?.abort ? ctrl.abort() : clearTimeout(ctrl),
      );
    };
  }, []);

  useEffect(() => {
    if (downloadError) {
      const timer = setTimeout(() => setDownloadError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [downloadError]);

  const toggleSiteVisibility = useCallback((siteId) => {
    setVisibleSites((prev) => {
      if (prev.includes(siteId)) {
        if (prev.length === 1) {
          CustomToast({
            message: 'At least one location must remain selected.',
            type: 'warning',
          });
          return prev;
        }
        return prev.filter((id) => id !== siteId);
      }
      return [...prev, siteId];
    });
  }, []);

  const handleSiteAction = useCallback(
    (siteId, action = 'toggle') => {
      if (!dataLoadingSites.includes(siteId)) {
        setDataLoadingSites((prev) => [...prev, siteId]);
        setVisibleSites((prev) => [...prev, siteId]);
        return true;
      }
      if (action === 'toggle') {
        toggleSiteVisibility(siteId);
        return false;
      }
      if (action === 'remove' && dataLoadingSites.length > 1) {
        setDataLoadingSites((prev) => prev.filter((id) => id !== siteId));
        setVisibleSites((prev) => prev.filter((id) => id !== siteId));
        return true;
      }
      return false;
    },
    [dataLoadingSites, toggleSiteVisibility],
  );

  const handleManualRefresh = useCallback(async () => {
    if (isManualRefresh || isValidating) return;
    controllersRef.current.abort?.abort();
    controllersRef.current.abort = new AbortController();
    setIsManualRefresh(true);
    setRefreshSuccess(false);
    try {
      await refetch({ signal: controllersRef.current.abort.signal });
    } catch {
      setIsManualRefresh(false);
    }
  }, [refetch, isManualRefresh, isValidating]);

  const handleDataDownload = async () => {
    if (!visibleSites.length) {
      CustomToast({
        message: 'Please select at least one site to download data.',
        type: 'warning',
      });
      return;
    }
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      controllersRef.current.download?.abort();
      controllersRef.current.download = new AbortController();
      const { startDate, endDate } = dateRange;
      const formattedStartDate = format(
        parseISO(startDate),
        "yyyy-MM-dd'T'00:00:00.000'Z'",
      );
      const formattedEndDate = format(
        parseISO(endDate),
        "yyyy-MM-dd'T'00:00:00.000'Z'",
      );
      const apiData = {
        startDateTime: formattedStartDate,
        endDateTime: formattedEndDate,
        sites: visibleSites,
        network: chartData.organizationName,
        pollutants: [chartData.pollutionType],
        frequency,
        datatype: 'calibrated',
        downloadType: 'csv',
        outputFormat: 'airqo-standard',
        minimum: true,
      };
      const downloadTimeout = setTimeout(() => {
        controllersRef.current.download?.abort();
        setDownloadError(
          'Download is taking longer than expected. Please try again.',
        );
        setDownloadLoading(false);
      }, 30000);
      const response = await fetchData(apiData);
      clearTimeout(downloadTimeout);
      let csvData = '';
      if (typeof response === 'string') {
        csvData = response.startsWith('resp')
          ? response.substring(4)
          : response;
      } else if (response && typeof response === 'object') {
        csvData = response.data
          ? typeof response.data === 'string'
            ? response.data
            : Array.isArray(response.data)
              ? `${Object.keys(response.data[0] || {}).join(',')}\n${response.data
                  .map((row) => Object.values(row).join(','))
                  .join('\n')}`
              : JSON.stringify(response.data)
          : JSON.stringify(response);
      }
      const fileName =
        visibleSites.length === 1
          ? `${allSites.find((s) => s._id === visibleSites[0])?.name || 'site'}_${chartData.pollutionType}_${format(
              parseISO(startDate),
              'yyyy-MM-dd',
            )}_to_${format(parseISO(endDate), 'yyyy-MM-dd')}.csv`
          : `${visibleSites.length}_sites_${chartData.pollutionType}_${format(
              parseISO(startDate),
              'yyyy-MM-dd',
            )}_to_${format(parseISO(endDate), 'yyyy-MM-dd')}.csv`;
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      if (blob.size > 10) {
        saveAs(blob, fileName);
        CustomToast({
          message: `Download complete for ${visibleSites.length} site(s)!`,
          type: 'success',
        });
      } else {
        throw new Error('No data available for the selected criteria');
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        setDownloadError('Download was canceled.');
      } else {
        setDownloadError(
          error.message || 'Error downloading data. Please try again.',
        );
      }
    } finally {
      setDownloadLoading(false);
      controllersRef.current.download = null;
    }
  };

  const handleDateChange = useCallback((start, end, label) => {
    if (start && end)
      setDateRange({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label,
      });
  }, []);

  const handleFrequencyChange = useCallback(
    (option) => frequency !== option && setFrequency(option),
    [frequency],
  );
  const handleChartTypeChange = useCallback(
    (option) => chartType !== option && setChartType(option),
    [chartType],
  );

  // Animation variants
  const contentVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  };
  const controlsVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };
  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.07 },
    },
  };

  const sidebarContent = useMemo(() => {
    if (!allSites.length)
      return (
        <motion.div
          className="text-gray-500 w-full text-sm h-auto flex flex-col justify-center items-center"
          variants={itemVariants}
        >
          <span className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations available
        </motion.div>
      );
    return (
      <motion.div className="space-y-3" variants={sidebarVariants}>
        {allSites.map((site) => (
          <motion.div
            key={site._id}
            variants={itemVariants}
            transition={{ duration: 0.2 }}
          >
            <LocationCard
              site={site}
              onToggle={() => handleSiteAction(site._id, 'toggle')}
              isSelected={visibleSites.includes(site._id)}
              isLoading={
                isValidating &&
                dataLoadingSites.includes(site._id) &&
                !visibleSites.includes(site._id)
              }
              disableToggle={
                dataLoadingSites.length <= 1 &&
                dataLoadingSites.includes(site._id)
              }
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }, [
    allSites,
    dataLoadingSites,
    visibleSites,
    handleSiteAction,
    isValidating,
    itemVariants,
    sidebarVariants,
  ]);

  const downloadTooltipContent = useMemo(() => {
    if (!visibleSites.length)
      return 'Please select at least one site to download data';
    if (visibleSites.length === dataLoadingSites.length)
      return 'Download data for all selected sites';
    return `Download data for ${visibleSites.length} checked site(s)`;
  }, [visibleSites.length, dataLoadingSites.length]);

  const RefreshButton = useMemo(
    () => (
      <Tooltip content="Refresh data" className="w-auto text-center">
        <button
          onClick={handleManualRefresh}
          disabled={isValidating}
          aria-label="Refresh data"
          className={`ml-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 ${
            isValidating
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:bg-gray-100'
          } transition-colors flex items-center`}
        >
          {isValidating && isManualRefresh ? (
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <RefreshIcon width={20} height={20} />
          )}
        </button>
      </Tooltip>
    ),
    [isValidating, isManualRefresh, handleManualRefresh],
  );

  const chartContent = useMemo(() => {
    if (isError)
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-[380px] space-y-3 bg-red-50 border border-red-200 rounded-md p-6 text-center"
        >
          <MdErrorOutline className="text-red-500 text-4xl" />
          <h3 className="text-red-800 text-lg font-semibold">
            Oops! Something went wrong.
          </h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">
            {error?.message?.includes('canceled') ||
            error?.message?.includes('aborted')
              ? 'Request was canceled. The server might be taking too long to respond.'
              : error?.message ||
                'Something went wrong loading the chart data.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsManualRefresh(false);
              setTimeout(handleManualRefresh, 100);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            disabled={isValidating}
          >
            {isValidating ? 'Refreshing...' : 'Try Again'}
          </motion.button>
        </motion.div>
      );
    if (
      chartLoading ||
      (isValidating && dataLoadingSites.length > 0 && !allSiteData?.length)
    )
      return <SkeletonLoader width="100%" height={380} />;
    if (allSiteData?.length)
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MoreInsightsChart
            data={allSiteData}
            selectedSites={dataLoadingSites}
            visibleSiteIds={visibleSites}
            chartType={chartType}
            frequency={frequency}
            width="100%"
            height={380}
            id="air-quality-chart"
            pollutantType={chartData.pollutionType}
            refreshChart={handleManualRefresh}
            isRefreshing={isValidating && isManualRefresh}
          />
        </motion.div>
      );
    return (
      <InfoMessage
        title="No Data"
        description="No data available for the selected sites and time period."
        variant="info"
        className="w-full h-full"
        action={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            disabled={isValidating}
          >
            {isValidating ? 'Refreshing...' : 'Retry'}
          </motion.button>
        }
      />
    );
  }, [
    isError,
    error,
    chartLoading,
    isValidating,
    dataLoadingSites,
    allSiteData,
    visibleSites,
    chartType,
    frequency,
    chartData.pollutionType,
    handleManualRefresh,
  ]);

  return (
    <ErrorBoundary name="MoreInsights" feature="Air Quality Insights">
      <motion.div
        className="flex w-full h-full overflow-hidden"
        variants={contentVariants}
        initial="initial"
        animate="animate"
      >
        {/* Sidebar */}
        <motion.div
          className="w-[280px] h-full overflow-y-auto border-r dark:border-gray-700 relative space-y-3 px-4 pt-2 pb-14"
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
        >
          {allSites.length > 1 && (
            <motion.div
              className="text-sm text-gray-500 mb-4"
              variants={itemVariants}
            >
              <p className="flex items-center">
                <span>Click checkbox to toggle visibility</span>
                <Tooltip
                  content="Checked sites will be included in downloads"
                  className="ml-1"
                >
                  <MdInfo className="text-blue-500" />
                </Tooltip>
              </p>
            </motion.div>
          )}
          {sidebarContent}
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="relative flex-1 h-full overflow-hidden"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-2 md:px-6 pt-4 pb-4 space-y-4 h-full flex flex-col">
            {/* Controls Bar */}
            <motion.div
              variants={controlsVariants}
              className="w-full flex flex-wrap gap-2 justify-between"
            >
              <div className="space-x-2 flex items-center">
                <CustomDropdown
                  text={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  className="left-0"
                >
                  {TIME_OPTIONS.map((option) => (
                    <DropdownItem
                      key={option}
                      onClick={() => handleFrequencyChange(option)}
                      active={frequency === option}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </DropdownItem>
                  ))}
                </CustomDropdown>

                <CustomCalendar
                  initialStartDate={new Date(dateRange.startDate)}
                  initialEndDate={new Date(dateRange.endDate)}
                  onChange={handleDateChange}
                  className="-left-10 md:left-16 top-11"
                  dropdown
                />

                <CustomDropdown
                  text={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                  className="left-0"
                >
                  {CHART_TYPE.map((option) => (
                    <DropdownItem
                      key={option.id}
                      onClick={() => handleChartTypeChange(option.id)}
                      active={chartType === option.id}
                    >
                      {option.name}
                    </DropdownItem>
                  ))}
                </CustomDropdown>

                {RefreshButton}
              </div>

              <div>
                <Tooltip
                  content={downloadTooltipContent}
                  className="w-auto text-center"
                >
                  <CustomDropdown
                    text={
                      downloadLoading
                        ? 'Downloading...'
                        : `Download ${visibleSites.length ? `(${visibleSites.length})` : 'Data'}`
                    }
                    isButton
                    onClick={handleDataDownload}
                    buttonStyle={{
                      backgroundColor: visibleSites.length
                        ? '#2563EB'
                        : '#9CA3AF',
                      color: 'white',
                      border: visibleSites.length
                        ? '1px solid #2563EB'
                        : '1px solid #9CA3AF',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.75rem',
                    }}
                    disabled={downloadLoading}
                  />
                </Tooltip>
              </div>
            </motion.div>

            {/* Download Error Notification */}
            <AnimatePresence>
              {downloadError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <SelectionMessage type="error">
                    {downloadError}
                  </SelectionMessage>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chart Container */}
            <motion.div
              variants={itemVariants}
              className="w-full border dark:border-gray-700 rounded-xl p-2 relative overflow-hidden"
            >
              <AnimatePresence>
                {refreshSuccess && !isValidating && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-2 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm"
                  >
                    <DoneRefreshed />
                    <span className="text-sm font-medium">Data refreshed</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>{chartContent}</AnimatePresence>
            </motion.div>

            {/* Selection Message for Hidden Sites */}
            <AnimatePresence>
              {dataLoadingSites.length > visibleSites.length && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <SelectionMessage type="info" className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {dataLoadingSites.length - visibleSites.length} site(s)
                    hidden and will not be included in downloads.
                  </SelectionMessage>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Air Quality Card */}
            <motion.div variants={itemVariants} className="flex-shrink-0">
              <AirQualityCard
                airQuality="--"
                pollutionSource="--"
                pollutant={
                  chartData.pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'
                }
                isLoading={chartLoading || isValidating}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default MoreInsights;
