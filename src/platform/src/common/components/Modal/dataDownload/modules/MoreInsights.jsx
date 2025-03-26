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
import { MdErrorOutline, MdInfo } from 'react-icons/md';
import { Refreshing, DoneRefreshed } from '../constants/svgs';
import InfoMessage from '../../../Messages/InfoMessage';

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
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const refreshTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const downloadControllerRef = useRef(null);

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
  const [dataLoadingSites, setDataLoadingSites] = useState(
    allSites.map((site) => site._id),
  );
  const [visibleSites, setVisibleSites] = useState(
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
   * Fetch analytics data using SWR hook with improved configuration
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
        organisationName: chartData.organizationName,
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

          // Clear refresh state if error occurs during refresh
          if (isManualRefresh) {
            setIsManualRefresh(false);
          }
        },
        onSuccess: () => {
          // If this was a manual refresh, show success message
          if (isManualRefresh) {
            setRefreshSuccess(true);
            setIsManualRefresh(false);

            // Clear success message after 3 seconds
            if (successTimeoutRef.current) {
              clearTimeout(successTimeoutRef.current);
            }
            successTimeoutRef.current = setTimeout(() => {
              setRefreshSuccess(false);
            }, 3000);
          }
        },
      },
    );

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (downloadControllerRef.current) {
        downloadControllerRef.current.abort();
      }
    };
  }, []);

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
   * Toggle site visibility in chart.
   * If it is the last visible site, prevent unchecking and show a warning notification.
   */
  const toggleSiteVisibility = useCallback((siteId) => {
    setVisibleSites((prev) => {
      // If the site is currently visible
      if (prev.includes(siteId)) {
        // Prevent unchecking if it is the only visible site
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
   * Handle manual refresh with improved handling of aborts and state management
   */
  const handleManualRefresh = useCallback(async () => {
    if (isManualRefresh || isValidating) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsManualRefresh(true);
    setRefreshSuccess(false);

    try {
      await refetch({ signal: abortControllerRef.current.signal });
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setIsManualRefresh(false);
      // Reset any stuck state that might prevent future refreshes
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    }
  }, [refetch, isManualRefresh, isValidating]);

  /**
   * Download data in CSV format with simplified error handling.
   * Only downloads data for visible (checked) sites.
   */
  const handleDataDownload = async () => {
    // Check if there are any visible sites to download
    if (visibleSites.length === 0) {
      CustomToast({
        message: 'Please select at least one site to download data.',
        type: 'warning',
      });
      return;
    }

    setDownloadLoading(true);
    setDownloadError(null);

    try {
      // Cancel any existing download request
      if (downloadControllerRef.current) {
        downloadControllerRef.current.abort();
      }

      downloadControllerRef.current = new AbortController();

      const { startDate, endDate } = dateRange;
      const formattedStartDate = format(
        parseISO(startDate),
        "yyyy-MM-dd'T'00:00:00.000'Z'",
      );
      const formattedEndDate = format(
        parseISO(endDate),
        "yyyy-MM-dd'T'00:00:00.000'Z'",
      );

      // Using visible sites instead of all data loading sites
      const sitesToDownload = visibleSites;

      // Look up site names for the filename
      const siteNames = sitesToDownload.map((siteId) => {
        const site = allSites.find((s) => s._id === siteId);
        return site ? site.name || 'Unknown' : 'Unknown';
      });

      // Create API request data
      const apiData = {
        startDateTime: formattedStartDate,
        endDateTime: formattedEndDate,
        sites: sitesToDownload, // Only download selected sites
        network: chartData.organizationName,
        pollutants: [chartData.pollutionType],
        frequency: frequency,
        datatype: 'calibrated',
        downloadType: 'csv',
        outputFormat: 'airqo-standard',
        minimum: true,
      };

      // Set a timeout for the download
      const downloadTimeout = setTimeout(() => {
        if (downloadControllerRef.current) {
          downloadControllerRef.current.abort();
          setDownloadError(
            'The download request is taking longer than expected. Please try again later.',
          );
          setDownloadLoading(false);
        }
      }, 30000);

      // Fetch the data
      const response = await fetchData(apiData);
      clearTimeout(downloadTimeout);

      // Simplified CSV handling
      let csvContent = '';

      if (typeof response === 'string') {
        // Direct string response (common in production)
        csvContent = response;

        // Remove 'resp' prefix if it exists
        if (csvContent.startsWith('resp')) {
          csvContent = csvContent.substring(4);
        }
      } else if (typeof response === 'object' && response !== null) {
        // Object response (common in development)
        if (response.data && typeof response.data === 'string') {
          csvContent = response.data;
        } else if (Array.isArray(response.data)) {
          // Convert array to CSV
          const headers = Object.keys(response.data[0] || {}).join(',');
          const rows = response.data
            .map((row) => Object.values(row).join(','))
            .join('\n');
          csvContent = headers ? `${headers}\n${rows}` : '';
        } else if (response.message && typeof response.message === 'string') {
          csvContent = response.message;
        }
      }

      // Create descriptive filename
      let fileName;
      if (sitesToDownload.length === 1) {
        // Single site
        fileName = `${siteNames[0]}_${chartData.pollutionType}_${format(
          parseISO(startDate),
          'yyyy-MM-dd',
        )}_to_${format(parseISO(endDate), 'yyyy-MM-dd')}.csv`;
      } else if (sitesToDownload.length === allSites.length) {
        // All sites
        fileName = `all_sites_${chartData.pollutionType}_${format(
          parseISO(startDate),
          'yyyy-MM-dd',
        )}_to_${format(parseISO(endDate), 'yyyy-MM-dd')}.csv`;
      } else {
        // Multiple sites
        fileName = `${sitesToDownload.length}_selected_sites_${
          chartData.pollutionType
        }_${format(parseISO(startDate), 'yyyy-MM-dd')}_to_${format(
          parseISO(endDate),
          'yyyy-MM-dd',
        )}.csv`;
      }

      // Save the file with proper encoding
      const mimeType = 'text/csv;charset=utf-8;';

      // No complex validation logic - just save what we have
      const blob = new Blob([csvContent], { type: mimeType });
      saveAs(blob, fileName);

      CustomToast({
        message: `Download complete for ${sitesToDownload.length} selected site(s)!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error during download:', error);

      if (
        error.name === 'AbortError' ||
        error.message?.includes('aborted') ||
        error.message?.includes('canceled')
      ) {
        setDownloadError('Download was canceled.');
      } else {
        setDownloadError(
          'There was an error downloading the data. Please try again later.',
        );
      }
    } finally {
      setDownloadLoading(false);
      if (downloadControllerRef.current) {
        downloadControllerRef.current = null;
      }
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
   * Generate sidebar content for site selection.
   * The checkbox state is now controlled by `visibleSites`.
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
        // Use visibleSites for the checked state so the UI reflects the toggle properly
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
   * Button tooltip content for download
   */
  const downloadTooltipContent = useMemo(() => {
    if (visibleSites.length === 0) {
      return 'Please select at least one site to download data';
    }
    if (visibleSites.length === dataLoadingSites.length) {
      return 'Download data for all selected sites';
    }
    return `Download data for ${visibleSites.length} checked site(s)`;
  }, [visibleSites.length, dataLoadingSites.length]);

  /**
   * Refresh button component with improved state handling
   */
  const RefreshButton = useMemo(
    () => (
      <Tooltip content="Refresh data" className="w-auto text-center">
        <button
          onClick={handleManualRefresh}
          disabled={isValidating}
          aria-label="Refresh data"
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
              aria-hidden="true"
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
            onClick={() => {
              // Force set isManualRefresh to false in case it's stuck
              setIsManualRefresh(false);
              // Short timeout to ensure state is updated before trying again
              setTimeout(() => {
                handleManualRefresh();
              }, 100);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            disabled={isValidating}
          >
            {isValidating ? 'Refreshing...' : 'Try Again'}
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

    return (
      <InfoMessage
        title="No Data"
        description="No data available for the selected sites and time period."
        variant="info"
        className="w-full h-full"
        action={
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            disabled={isValidating}
          >
            {isValidating ? 'Refreshing...' : 'Retry'}
          </button>
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
    setIsManualRefresh,
  ]);

  return (
    <div className="flex w-full h-full">
      {/* Sidebar for Sites */}
      <div className="w-auto h-auto md:w-[280px] md:h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-2 pb-14">
        <div className="text-sm text-gray-500 mb-4">
          <p className="flex items-center">
            <span>Click checkbox to toggle visibility</span>
            <Tooltip
              content="Checked sites will be included in downloads"
              className="ml-1"
            >
              <MdInfo className="text-blue-500" />
            </Tooltip>
          </p>
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

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-full">
        <div className="px-2 md:px-8 pt-6 pb-4 space-y-4 relative h-full w-full overflow-y-auto md:overflow-hidden">
          {/* Controls: Dropdowns and Actions */}
          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex items-center">
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

              <CustomCalendar
                initialStartDate={new Date(dateRange.startDate)}
                initialEndDate={new Date(dateRange.endDate)}
                onChange={handleDateChange}
                className="-left-10 md:left-16 top-11"
                dropdown
              />

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

              {RefreshButton}
            </div>

            <div>
              <Tooltip
                content={downloadTooltipContent}
                className="w-auto text-center"
              >
                <TabButtons
                  btnText={`Download ${
                    visibleSites.length > 0
                      ? `(${visibleSites.length})`
                      : 'Data'
                  }`}
                  Icon={<DownloadIcon width={16} height={17} color="white" />}
                  onClick={handleDataDownload}
                  btnStyle={`${
                    visibleSites.length > 0 ? 'bg-blue-600' : 'bg-gray-400'
                  } text-white border ${
                    visibleSites.length > 0
                      ? 'border-blue-600'
                      : 'border-gray-400'
                  } px-3 py-2 rounded-xl`}
                  isLoading={downloadLoading}
                  disabled={
                    downloadLoading ||
                    chartLoading ||
                    isValidating ||
                    visibleSites.length === 0
                  }
                />
              </Tooltip>
            </div>
          </div>

          {downloadError && (
            <div className="w-full flex items-center justify-start h-auto">
              <p className="text-red-500 font-semibold">{downloadError}</p>
            </div>
          )}

          <div className="w-full h-auto border rounded-xl border-grey-150 p-2 relative">
            {refreshSuccess && !isValidating && (
              <div className="absolute top-2 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm">
                <DoneRefreshed />
                <span className="text-sm font-medium">Data refreshed</span>
              </div>
            )}

            {isManualRefresh && isValidating && (
              <div className="absolute top-2 right-4 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm animate-pulse">
                <Refreshing />
                <span className="text-sm font-medium">Refreshing data...</span>
              </div>
            )}

            {chartContent}
          </div>

          {/* Site visibility indicator with info about download */}
          {dataLoadingSites.length > visibleSites.length && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded flex items-center">
              <svg
                className="h-4 w-4 mr-2 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {dataLoadingSites.length - visibleSites.length} site(s) hidden
                and will not be included in downloads. Check the boxes in the
                sidebar to include them.
              </span>
            </div>
          )}

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
