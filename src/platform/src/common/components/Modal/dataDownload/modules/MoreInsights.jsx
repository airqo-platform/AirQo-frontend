import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import MoreInsightsChart from '@/components/Charts/MoreInsightsChart';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';
import useDataDownload from '@/core/hooks/useDataDownload';
import AirQualityCard from '../components/AirQualityCard';
import LocationCard from '../components/LocationCard';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import { format, parseISO } from 'date-fns';
import { saveAs } from 'file-saver';
import CustomToast from '../../../Toast/CustomToast';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import SkeletonLoader from '@/components/Charts/components/SkeletonLoader';
import { Tooltip } from 'flowbite-react';
import { MdErrorOutline } from 'react-icons/md';

/**
 * InSightsHeader Component
 */
export const InSightsHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Analytics
  </h3>
);

/**
 * MoreInsights Component - Advanced analytics dashboard
 */
const MoreInsights = () => {
  // Redux state
  const modalData = useSelector((state) => state.modal.modalType?.data);
  const chartData = useSelector((state) => state.chart);

  // Local state
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [frequency, setFrequency] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const refreshTimeoutRef = useRef(null);

  // API hooks
  const fetchData = useDataDownload();

  /**
   * Ensure `allSites` is an array
   */
  const allSites = useMemo(() => {
    if (Array.isArray(modalData)) return modalData;
    if (modalData) return [modalData];
    return [];
  }, [modalData]);

  /**
   * Data fetching and visibility states
   */
  const [dataLoadingSites, setDataLoadingSites] = useState(() =>
    allSites.map((site) => site._id),
  );
  const [visibleSites, setVisibleSites] = useState(() =>
    allSites.map((site) => site._id),
  );

  /**
   * Initialize date range to last 7 days
   */
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

  /**
   * Fetch analytics data using SWR hook
   */
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
        organisationName: chartData.organisationName,
      },
      {
        revalidateOnFocus: false,
        dedupingInterval: 10000,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        errorRetryCount: 3,
        errorRetryInterval: 3000,
        focusThrottleInterval: 10000,
        loadingTimeout: 30000,
        onError: (err) => {
          if (
            err.name === 'AbortError' ||
            err.message?.includes('aborted') ||
            err.message?.includes('canceled')
          ) {
            console.log('Request aborted, this is expected behavior');
            return;
          }
          console.error('Error fetching analytics data:', err);
        },
      },
    );

  // Clear manual refresh state after timeout
  useEffect(() => {
    if (isManualRefresh && !isValidating) {
      refreshTimeoutRef.current = setTimeout(() => {
        setIsManualRefresh(false);
      }, 3000);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isManualRefresh, isValidating]);

  // Clear download error after timeout
  useEffect(() => {
    if (downloadError) {
      const timer = setTimeout(() => {
        setDownloadError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [downloadError]);

  /**
   * Toggle site visibility in chart
   */
  const toggleSiteVisibility = useCallback((siteId) => {
    setVisibleSites((prev) => {
      const isVisible = prev.includes(siteId);
      // If trying to hide and this is the last visible site, prevent it
      if (isVisible && prev.length <= 1) {
        return prev;
      }
      // Toggle visibility state
      return isVisible ? prev.filter((id) => id !== siteId) : [...prev, siteId];
    });
  }, []);

  /**
   * Add a site to load data for
   */
  const addDataLoadingSite = useCallback(
    (siteId) => {
      if (!dataLoadingSites.includes(siteId)) {
        setDataLoadingSites((prev) => [...prev, siteId]);
        setVisibleSites((prev) => [...prev, siteId]);
        return true; // Data reload will happen
      }
      return false; // No data reload needed
    },
    [dataLoadingSites],
  );

  /**
   * Remove a site from data loading
   */
  const removeDataLoadingSite = useCallback(
    (siteId) => {
      if (dataLoadingSites.length <= 1) {
        return false;
      }
      setDataLoadingSites((prev) => prev.filter((id) => id !== siteId));
      setVisibleSites((prev) => prev.filter((id) => id !== siteId));
      return true;
    },
    [dataLoadingSites],
  );

  /**
   * Add multiple sites to data loading at once
   */
  const addMultipleSites = useCallback((siteIds) => {
    if (!Array.isArray(siteIds) || siteIds.length === 0) return false;
    setDataLoadingSites((prev) => {
      const newSites = siteIds.filter((id) => !prev.includes(id));
      if (newSites.length === 0) return prev;
      return [...prev, ...newSites];
    });
    setVisibleSites((prev) => {
      const newVisible = [...prev];
      siteIds.forEach((id) => {
        if (!newVisible.includes(id)) {
          newVisible.push(id);
        }
      });
      return newVisible;
    });
    return true;
  }, []);

  /**
   * Add all available sites at once
   */
  const addAllSites = useCallback(() => {
    const allSiteIds = allSites.map((site) => site._id);
    return addMultipleSites(allSiteIds);
  }, [allSites, addMultipleSites]);

  /**
   * Handle site click actions (toggle or remove)
   */
  const handleSiteClick = useCallback(
    (siteId, action = 'toggle') => {
      if (!dataLoadingSites.includes(siteId)) {
        return addDataLoadingSite(siteId);
      }
      if (action === 'toggle') {
        toggleSiteVisibility(siteId);
        return false;
      }
      if (action === 'remove') {
        return removeDataLoadingSite(siteId);
      }
      return false;
    },
    [
      dataLoadingSites,
      toggleSiteVisibility,
      addDataLoadingSite,
      removeDataLoadingSite,
    ],
  );

  /**
   * Handle manual refresh
   */
  const handleManualRefresh = useCallback(() => {
    setIsManualRefresh(true);
    setTimeout(() => {
      refetch().catch((err) => {
        console.error('Manual refresh failed:', err);
        setTimeout(() => setIsManualRefresh(false), 1000);
      });
    }, 100);
  }, [refetch]);

  /**
   * Download data in CSV format
   */
  const handleDataDownload = async () => {
    setDownloadLoading(true);
    try {
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
        sites: dataLoadingSites,
        network: chartData.organizationName,
        pollutants: [chartData.pollutionType],
        frequency: frequency,
        datatype: 'calibrated',
        downloadType: 'csv',
        outputFormat: 'airqo-standard',
        minimum: true,
      };
      const data = await fetchData(apiData);
      const mimeType = 'text/csv;charset=utf-8;';
      const fileName = `analytics_data_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      const blob = new Blob([data], { type: mimeType });
      saveAs(blob, fileName);
      CustomToast();
    } catch (error) {
      console.error('Error during download:', error);
      setDownloadError(
        'There was an error downloading the data. Please try again later.',
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  /**
   * Date range change handler
   */
  const handleDateChange = useCallback((start, end, label) => {
    if (start && end) {
      setDateRange({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label,
      });
    }
  }, []);

  /**
   * Frequency change handler
   */
  const handleFrequencyChange = useCallback(
    (option) => {
      if (frequency !== option) {
        setFrequency(option);
      }
    },
    [frequency],
  );

  /**
   * Chart type change handler
   */
  const handleChartTypeChange = useCallback(
    (option) => {
      if (chartType !== option) {
        setChartType(option);
      }
    },
    [chartType],
  );

  /**
   * Generate sidebar content for site selection
   */
  const allSitesContent = useMemo(() => {
    if (!Array.isArray(allSites) || allSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-auto flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations available
        </div>
      );
    }
    return allSites.map((site) => (
      <LocationCard
        key={site._id}
        site={site}
        onToggle={() => handleSiteClick(site._id, 'toggle')}
        onRemove={() => handleSiteClick(site._id, 'remove')}
        isSelected={visibleSites.includes(site._id)}
        isVisible={visibleSites.includes(site._id)}
        isLoading={
          isValidating &&
          dataLoadingSites.includes(site._id) &&
          !visibleSites.includes(site._id)
        }
        disableToggle={
          dataLoadingSites.length <= 1 && dataLoadingSites.includes(site._id)
        }
      />
    ));
  }, [allSites, dataLoadingSites, visibleSites, handleSiteClick, isValidating]);

  /**
   * Refresh button component
   */
  const RefreshButton = useMemo(
    () => (
      <Tooltip content="Refresh data" className="w-auto text-center">
        <button
          onClick={handleManualRefresh}
          disabled={isValidating}
          className={`ml-2 p-2 rounded-md border border-gray-200 ${
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <RefreshIcon width={20} height={20} />
          )}
        </button>
      </Tooltip>
    ),
    [isValidating, isManualRefresh, handleManualRefresh],
  );

  /**
   * Determine chart content based on loading/error states
   */
  const chartContent = useMemo(() => {
    if (isError) {
      // Enhanced error UI
      return (
        <div className="flex flex-col items-center justify-center h-[380px] space-y-3 bg-red-50 border border-red-200 rounded-md p-6 text-center">
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
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (
      chartLoading ||
      (isValidating && dataLoadingSites.length > 0 && !allSiteData?.length)
    ) {
      return <SkeletonLoader width="100%" height={380} />;
    }

    if (allSiteData?.length > 0) {
      return (
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
      );
    }

    // No data scenario
    return (
      <div className="w-full flex flex-col items-center justify-center h-[380px] space-y-3">
        <p className="text-gray-600 text-sm font-medium">
          No data available for the selected sites and time period.
        </p>
        <button
          onClick={handleManualRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
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
    <div className="flex w-full h-full">
      {/* -------------------- Sidebar for Sites -------------------- */}
      <div className="w-auto h-auto md:w-[280px] md:h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-2 pb-14">
        <div className="text-sm text-gray-500 mb-4">
          <p>Click checkbox to toggle visibility</p>

          {/* Add button to load all sites */}
          {allSites.length > dataLoadingSites.length && (
            <button
              onClick={addAllSites}
              className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors w-full"
            >
              Load all {allSites.length} sites
            </button>
          )}
        </div>
        {allSitesContent}
      </div>

      {/* -------------------- Main Content Area -------------------- */}
      <div className="bg-white relative w-full h-full">
        <div className="px-2 md:px-8 pt-6 pb-4 space-y-4 relative h-full w-full overflow-y-auto md:overflow-hidden">
          {/* -------------------- Controls: Dropdowns and Actions -------------------- */}
          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex items-center">
              {/* Frequency Dropdown */}
              <CustomDropdown
                btnText={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                dropdown
                id="frequency"
                className="left-0"
              >
                {TIME_OPTIONS.map((option) => (
                  <span
                    key={option}
                    onClick={() => handleFrequencyChange(option)}
                    className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                      frequency === option ? 'bg-[#EBF5FF] rounded-md' : ''
                    }`}
                  >
                    <span>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    {frequency === option && <CheckIcon fill="#145FFF" />}
                  </span>
                ))}
              </CustomDropdown>

              {/* Date Range Picker */}
              <CustomCalendar
                initialStartDate={new Date(dateRange.startDate)}
                initialEndDate={new Date(dateRange.endDate)}
                onChange={handleDateChange}
                className="-left-10 md:left-16 top-11"
                dropdown
              />

              {/* Chart Type Dropdown */}
              <CustomDropdown
                btnText={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                id="chartType"
                className="left-0"
              >
                {CHART_TYPE.map((option) => (
                  <span
                    key={option.id}
                    onClick={() => handleChartTypeChange(option.id)}
                    className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                      chartType === option.id ? 'bg-[#EBF5FF] rounded-md' : ''
                    }`}
                  >
                    <span>{option.name}</span>
                    {chartType === option.id && <CheckIcon fill="#145FFF" />}
                  </span>
                ))}
              </CustomDropdown>

              {/* Refresh Button */}
              {RefreshButton}
            </div>

            {/* Actions: Download Data */}
            <div>
              <Tooltip
                content="Download calibrated data in CSV format"
                className="w-auto text-center"
              >
                <TabButtons
                  btnText="Download Data"
                  Icon={<DownloadIcon width={16} height={17} color="white" />}
                  onClick={handleDataDownload}
                  btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-2 rounded-xl"
                  isLoading={downloadLoading}
                  disabled={downloadLoading || chartLoading || isValidating}
                />
              </Tooltip>
            </div>
          </div>

          {/* -------------------- Download Error -------------------- */}
          {downloadError && (
            <div className="w-full flex items-center justify-start h-auto">
              <p className="text-red-500 font-semibold">{downloadError}</p>
            </div>
          )}

          {/* -------------------- Chart Display -------------------- */}
          <div className="w-full h-auto border rounded-xl border-grey-150 p-2 relative">
            {/* Success Message After Refresh */}
            {!isValidating && isManualRefresh && (
              <div className="absolute top-2 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm">
                <svg
                  className="mr-2 h-4 w-4 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Data refreshed</span>
              </div>
            )}

            {/* Chart Content based on loading/error states */}
            {chartContent}
          </div>

          {/* Site visibility indicator */}
          {dataLoadingSites.length > visibleSites.length && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded flex items-center">
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
              <span>
                {dataLoadingSites.length - visibleSites.length} site(s) hidden.
                Check the boxes in the sidebar to show them.
              </span>
            </div>
          )}

          {/* -------------------- Air Quality Card -------------------- */}
          <AirQualityCard
            airQuality="--"
            pollutionSource="--"
            pollutant={chartData.pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'}
            isLoading={chartLoading || isValidating}
          />
        </div>
      </div>
    </div>
  );
};

export default MoreInsights;
