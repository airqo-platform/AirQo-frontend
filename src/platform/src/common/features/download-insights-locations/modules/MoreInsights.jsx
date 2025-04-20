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
import { IoIosMenu } from 'react-icons/io';
import Close from '@/icons/close_icon';
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
import Button from '@/components/Button';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import LineChartIcon from '@/icons/Charts/LineChartIcon';

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
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [frequency, setFrequency] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const controllersRef = useRef({});
  const fetchData = useDataDownload();

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
          if (err.name === 'AbortError' || err.message.includes('aborted'))
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

  useEffect(
    () => () => {
      Object.values(controllersRef.current).forEach((ctrl) =>
        ctrl?.abort ? ctrl.abort() : clearTimeout(ctrl),
      );
    },
    [],
  );

  useEffect(() => {
    if (!downloadError) return;
    const timer = setTimeout(() => setDownloadError(null), 5000);
    return () => clearTimeout(timer);
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
      if (action === 'toggle') return !toggleSiteVisibility(siteId);
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
      return CustomToast({
        message: 'Please select at least one site to download data.',
        type: 'warning',
      });
    }
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      controllersRef.current.download?.abort();
      controllersRef.current.download = new AbortController();
      const formattedStart = format(
        parseISO(dateRange.startDate),
        "yyyy-MM-dd'T'00:00:00.000'Z'",
      );
      const formattedEnd = format(
        parseISO(dateRange.endDate),
        "yyyy-MM-dd'T'00:00:00.000'Z'",
      );
      const apiData = {
        startDateTime: formattedStart,
        endDateTime: formattedEnd,
        sites: visibleSites,
        network: chartData.organizationName,
        pollutants: [chartData.pollutionType],
        frequency,
        datatype: 'calibrated',
        downloadType: 'csv',
        outputFormat: 'airqo-standard',
        minimum: true,
      };

      const timeout = setTimeout(() => {
        controllersRef.current.download.abort();
        setDownloadError(
          'Download is taking longer than expected. Please try again.',
        );
        setDownloadLoading(false);
      }, 30000);

      const response = await fetchData(apiData);
      clearTimeout(timeout);
      let csvData = '';
      if (typeof response === 'string') csvData = response.replace(/^resp/, '');
      else if (response?.data) {
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        csvData = `${Object.keys(data[0] || {}).join(',')}
${data.map((row) => Object.values(row).join(',')).join('\n')}`;
      }

      const fileName =
        visibleSites.length === 1
          ? `${allSites.find((s) => s._id === visibleSites[0])?.name}_${chartData.pollutionType}_${format(parseISO(dateRange.startDate), 'yyyy-MM-dd')}_to_${format(parseISO(dateRange.endDate), 'yyyy-MM-dd')}.csv`
          : `${visibleSites.length}_sites_${chartData.pollutionType}_${format(parseISO(dateRange.startDate), 'yyyy-MM-dd')}_to_${format(parseISO(dateRange.endDate), 'yyyy-MM-dd')}.csv`;

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      if (blob.size > 10) saveAs(blob, fileName);
      else throw new Error('No data available for the selected criteria');
      CustomToast({
        message: `Download complete for ${visibleSites.length} site(s)!`,
        type: 'success',
      });
    } catch (err) {
      const msg =
        err.name === 'AbortError' ? 'Download was canceled.' : err.message;
      setDownloadError(msg || 'Error downloading data. Please try again.');
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
    (opt) => opt !== frequency && setFrequency(opt),
    [frequency],
  );
  const handleChartTypeChange = useCallback(
    (opt) => opt !== chartType && setChartType(opt),
    [chartType],
  );

  // Variants
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
    controls: {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    },
  };

  // Sidebar renderer
  const renderSidebar = () => (
    <motion.div
      variants={variants.sidebar}
      initial="hidden"
      animate="visible"
      className="space-y-3 p-4 border-r dark:border-gray-700 dark:bg-[#1d1f20] h-full overflow-y-auto min-h-full"
    >
      {allSites.map((site) => (
        <motion.div
          key={site._id}
          variants={variants.item}
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

  // Chart renderer
  const renderChart = () => {
    if (isError)
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center h-96 bg-red-50 border border-red-200 rounded-md p-6 text-center"
        >
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
        </motion.div>
      );

    if (
      chartLoading ||
      (isValidating && dataLoadingSites.length && !allSiteData.length)
    )
      return <SkeletonLoader width="100%" height={380} />;

    if (allSiteData.length)
      return (
        <motion.div initial="hidden" animate="visible">
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
    <ErrorBoundary name="MoreInsights" feature="Air Quality Insights">
      <motion.div
        className="relative flex flex-col lg:flex-row h-full overflow-hidden bg-transparent"
        variants={variants.content}
        initial="initial"
        animate="animate"
      >
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[280px] h-full overflow-y-auto">
          {renderSidebar()}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden px-4 pt-2">
          <button
            aria-label="Open sidebar"
            onClick={() => setMobileSidebarVisible(true)}
          >
            <IoIosMenu size={24} className="text-gray-600 dark:text-gray-200" />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarVisible && (
            <>
              <motion.div className="absolute inset-0 z-50 flex h-full">
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="w-[280px] h-full bg-white dark:bg-[#1d1f20] shadow-lg"
                >
                  <div className="flex justify-end p-2">
                    <button
                      aria-label="Close sidebar"
                      onClick={() => setMobileSidebarVisible(false)}
                    >
                      <Close />
                    </button>
                  </div>
                  {renderSidebar()}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex flex-col space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
            {/* Controls Bar */}
            <motion.div
              variants={variants.controls}
              className="flex flex-col md:flex-row w-full justify-between gap-2"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <CustomDropdown
                  dropdownWidth="150px"
                  icon={window.innerWidth < 640 ? <FrequencyIcon /> : undefined}
                  text={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                >
                  {TIME_OPTIONS.map((opt) => (
                    <DropdownItem
                      key={opt}
                      onClick={() => handleFrequencyChange(opt)}
                      active={frequency === opt}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </DropdownItem>
                  ))}
                </CustomDropdown>

                <CustomCalendar
                  initialStartDate={new Date(dateRange.startDate)}
                  initialEndDate={new Date(dateRange.endDate)}
                  onChange={handleDateChange}
                  horizontalOffset={60}
                  dropdown
                />

                <CustomDropdown
                  dropdownWidth="150px"
                  icon={window.innerWidth < 640 ? <LineChartIcon /> : undefined}
                  text={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                >
                  {CHART_TYPE.map((opt) => (
                    <DropdownItem
                      key={opt.id}
                      onClick={() => handleChartTypeChange(opt.id)}
                      active={chartType === opt.id}
                    >
                      {opt.name}
                    </DropdownItem>
                  ))}
                </CustomDropdown>

                <Tooltip content="Refresh data">
                  <button
                    onClick={handleManualRefresh}
                    disabled={isValidating}
                    className="p-1 md:p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {isValidating && isManualRefresh ? (
                      <RefreshIcon className="animate-spin" />
                    ) : (
                      <RefreshIcon />
                    )}
                  </button>
                </Tooltip>
              </div>
              <div>
                <Tooltip
                  content={
                    !visibleSites.length
                      ? 'Select at least one site'
                      : `Download (${visibleSites.length})`
                  }
                >
                  <Button
                    onClick={handleDataDownload}
                    disabled={downloadLoading}
                  >
                    {downloadLoading
                      ? 'Downloading...'
                      : `Download ${visibleSites.length ? `(${visibleSites.length})` : 'Data'}`}
                  </Button>
                </Tooltip>
              </div>
            </motion.div>

            {/* Download Error */}
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
              variants={variants.item}
              className="relative border dark:border-gray-700 rounded-xl p-2 h-full"
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
                    <span className="text-sm font-medium ml-1">
                      Data refreshed
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {renderChart()}
            </motion.div>

            {/* Hidden sites info */}
            <AnimatePresence>
              {dataLoadingSites.length > visibleSites.length && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 text-blue-600"
                >
                  <MdInfo />
                  <span>
                    {dataLoadingSites.length - visibleSites.length} site(s)
                    hidden and won&apos;t download
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Air Quality Card */}
            <motion.div variants={variants.item} className="flex-shrink-0">
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
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default MoreInsights;
