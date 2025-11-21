'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WideDialog from '@/shared/components/ui/wide-dialog';
import LocationCard from '@/shared/components/ui/location-card';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { HiPlus } from 'react-icons/hi';
import { HiMagnifyingGlass, HiXMark, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { cn } from '@/shared/lib/utils';
import type {
  FrequencyType,
  PollutantType,
  ChartType,
} from '@/shared/components/charts/types';
import { POLLUTANT_LABELS } from '@/shared/components/charts/constants';
import type { ChartData } from '@/modules/analytics/types';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import type { ChartDataPoint } from '@/shared/types/api';

// Pollutant options
const POLLUTANT_OPTIONS = Object.entries(POLLUTANT_LABELS).map(
  ([value, label]) => ({
    label,
    value: value.toUpperCase(),
  })
);
import {
  selectSelectedSites,
  selectIsDialogOpen,
} from '@/shared/store/selectors';
import {
  closeDialog,
  openAddLocation,
  removeSelectedSite,
} from '@/shared/store/insightsSlice';
import type { SelectedSite } from '@/shared/store/insightsSlice';
import InsightsFilters from './insights-filters';
import { Card, CardContent } from '@/shared/components/ui/card';
import { InfoBanner } from '@/shared/components/ui/banner';
import { useUser } from '@/shared/hooks/useUser';
import { useGetChartData } from '@/shared/hooks/useAnalytics';
import { useDataDownload } from '@/modules/analytics/hooks';
import { toast } from '@/shared/components/ui/toast';

type MoreInsightsProps = {
  activeTab?: 'sites' | 'devices';
};

// Configuration constants for site management
const MAX_VISIBLE_SITES = 8; // Maximum sites that can be displayed on chart simultaneously
const INITIAL_VISIBLE_SITES = 5; // Number of sites to show initially when dialog opens

export const MoreInsights: React.FC<MoreInsightsProps> = ({ activeTab }) => {
  const dispatch = useDispatch();

  // Get state from Redux
  const selectedSites = useSelector(selectSelectedSites);
  const isOpen = useSelector(selectIsDialogOpen('more-insights'));

  // Get user data for personalized banner dismissal
  const { user } = useUser();

  // Initialize default date range to last 7 days
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return { from: startDate, to: endDate };
  };

  // Local state for filters (not managed by Redux)
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [pollutant, setPollutant] = useState<PollutantType>('pm2_5');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(
    getDefaultDateRange()
  );
  const [dataType, setDataType] = useState<'calibrated' | 'raw'>('calibrated');

  // State for tracking which sites are visible on chart (checked)
  const [visibleSites, setVisibleSites] = useState<Set<string>>(new Set());

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Banner dismissal state
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined' && user?.id) {
      return (
        localStorage.getItem(`more-insights-banner-dismissed-${user.id}`) ===
        'true'
      );
    }
    return false;
  });

  // Chart data hook
  const { trigger: getChartData, isMutating: isChartLoading } =
    useGetChartData();

  // Download hook
  const { downloadData, isDownloading } = useDataDownload();

  // Get visible site IDs for chart data
  const visibleSiteIds = useMemo(() => {
    return Array.from(visibleSites);
  }, [visibleSites]);

  // Filtered sites based on search query
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return selectedSites;
    const query = searchQuery.toLowerCase();
    return selectedSites.filter(
      (site: SelectedSite) =>
        site.name.toLowerCase().includes(query) ||
        (site.country && site.country.toLowerCase().includes(query)) ||
        (site.city && site.city.toLowerCase().includes(query)) ||
        (site.region && site.region.toLowerCase().includes(query)) ||
        (site.device_name && site.device_name.toLowerCase().includes(query))
    );
  }, [selectedSites, searchQuery]);

  // Bulk operations
  const handleSelectAllVisible = () => {
    const availableSlots = MAX_VISIBLE_SITES - visibleSites.size;
    if (availableSlots <= 0) {
      toast.warning(
        'Maximum Sites Reached',
        `You can display a maximum of ${MAX_VISIBLE_SITES} sites on the chart simultaneously.`
      );
      return;
    }

    const sitesToAdd = filteredSites
      .filter((site: SelectedSite) => !visibleSites.has(site._id))
      .slice(0, availableSlots);

    if (sitesToAdd.length === 0) {
      toast.info(
        'All Sites Already Visible',
        'All filtered sites are already displayed on the chart.'
      );
      return;
    }

    setVisibleSites(prev => {
      const newSet = new Set(prev);
      sitesToAdd.forEach((site: SelectedSite) => newSet.add(site._id));
      return newSet;
    });

    toast.success(
      'Sites Added',
      `Added ${sitesToAdd.length} site${sitesToAdd.length > 1 ? 's' : ''} to the chart.`
    );
  };

  const handleDeselectAll = () => {
    setVisibleSites(new Set());
    toast.info(
      'All Sites Hidden',
      'All sites have been removed from the chart.'
    );
  };

  // Handle banner dismissal
  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`more-insights-banner-dismissed-${user.id}`, 'true');
    }
  };

  // Chart data state
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Fetch chart data when filters or visible sites change
  const fetchChartData = useCallback(async () => {
    // Only fetch if we have visible sites and a date range
    if (visibleSiteIds.length === 0 || !dateRange?.from || !dateRange?.to) {
      setChartData([]);
      return;
    }

    try {
      const response = await getChartData({
        sites: visibleSiteIds,
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        chartType: chartType,
        frequency: frequency,
        pollutant: pollutant.toLowerCase().replace('.', '_'),
        organisation_name: '',
      });

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Transform API data to chart format
        const transformed = normalizeAirQualityData(
          response.data as ChartDataPoint[]
        );
        setChartData(transformed);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    }
  }, [
    visibleSiteIds,
    dateRange?.from,
    dateRange?.to,
    chartType,
    frequency,
    pollutant,
    getChartData,
  ]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Initialize visible sites when selectedSites changes or dialog opens
  React.useEffect(() => {
    if (isOpen && selectedSites.length > 0) {
      // Smart initial selection: show only first N sites to avoid chart clutter
      const initialVisibleCount = Math.min(
        INITIAL_VISIBLE_SITES,
        selectedSites.length
      );
      const initialVisibleSites = selectedSites
        .slice(0, initialVisibleCount)
        .map((site: SelectedSite) => site._id);
      setVisibleSites(new Set(initialVisibleSites));

      // Show toast notification if there are more sites available
      if (selectedSites.length > INITIAL_VISIBLE_SITES) {
        toast.info(
          'Chart Optimized',
          `Showing ${initialVisibleCount} of ${selectedSites.length} selected sites on chart. Use the sidebar to add more sites for comparison.`
        );
      }
    }
  }, [selectedSites, isOpen]);

  // Handle site visibility toggle (for chart display)
  const handleSiteVisibilityToggle = (siteId: string) => {
    setVisibleSites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        // Removing site - always allowed
        newSet.delete(siteId);
      } else {
        // Adding site - check limit
        if (newSet.size >= MAX_VISIBLE_SITES) {
          toast.warning(
            'Maximum Sites Reached',
            `You can display a maximum of ${MAX_VISIBLE_SITES} sites on the chart simultaneously. Please remove a site before adding another.`
          );
          return prev;
        }

        // Show warning when approaching limit
        const remainingSlots = MAX_VISIBLE_SITES - newSet.size;
        if (remainingSlots <= 2 && remainingSlots > 0) {
          toast.info(
            'Approaching Limit',
            `You can add ${remainingSlots} more site${remainingSlots > 1 ? 's' : ''} to the chart.`
          );
        }

        newSet.add(siteId);
      }
      return newSet;
    });
  };

  // Handle adding/removing sites from the selected list
  const handleSiteToggle = (siteId: string) => {
    dispatch(removeSelectedSite(siteId));
  };

  // Handle close dialog
  const handleClose = () => {
    dispatch(closeDialog('more-insights'));
  };

  // Handle add location
  const handleAddLocation = () => {
    dispatch(closeDialog('more-insights'));
    dispatch(openAddLocation());
  };

  // Dynamic header based on selected sites
  const getHeaderTitle = () => {
    if (selectedSites.length === 0) {
      return 'Air Quality Insights';
    } else if (selectedSites.length === 1) {
      return `Air Quality Insights - ${selectedSites[0].name}`;
    } else {
      return `Air Quality Insights - ${selectedSites.length} Locations`;
    }
  };

  const getHeaderSubtitle = () => {
    if (selectedSites.length === 1) {
      const site = selectedSites[0];
      const location = [site.city, site.region, site.country]
        .filter(Boolean)
        .join(', ');
      return location ? `Location: ${location}` : null;
    } else if (selectedSites.length > 1) {
      const visibleCount = visibleSites.size;
      const totalCount = selectedSites.length;
      return `${visibleCount} of ${totalCount} locations visible on chart`;
    }
    return null;
  };

  // Handle download
  const handleDownload = useCallback(
    async (selectedDataType?: 'calibrated' | 'raw') => {
      const dataTypeToUse = selectedDataType || dataType;
      if (selectedSites.length === 0) {
        toast.error(
          'No Sites Selected',
          'Please select at least one site to download data.'
        );
        return;
      }

      if (!dateRange?.from || !dateRange?.to) {
        toast.error(
          'Invalid Date Range',
          'Please select a valid date range for download.'
        );
        return;
      }

      try {
        // Create start date (beginning of day in UTC)
        const startDate = new Date(dateRange.from);
        startDate.setUTCHours(0, 0, 0, 0);
        const startDateTime = startDate.toISOString();

        // Create end date (end of day in UTC)
        const endDate = new Date(dateRange.to);
        endDate.setUTCHours(23, 59, 59, 999);
        const endDateTime = endDate.toISOString();

        // Validate date formats
        const expectedPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        if (!expectedPattern.test(startDateTime)) {
          console.error('startDateTime format invalid:', startDateTime);
          toast.error(
            'Date Format Error',
            'Start date format is invalid for backend.'
          );
          return;
        }
        if (!expectedPattern.test(endDateTime)) {
          console.error('endDateTime format invalid:', endDateTime);
          toast.error(
            'Date Format Error',
            'End date format is invalid for backend.'
          );
          return;
        }

        const request = {
          datatype: dataTypeToUse,
          downloadType: 'csv' as const,
          endDateTime,
          frequency: frequency as 'daily',
          minimum: true,
          outputFormat: 'airqo-standard' as const,
          pollutants: [pollutant],
          metaDataFields: ['latitude', 'longitude'],
          weatherFields: ['temperature', 'humidity'],
          startDateTime,
          sites: selectedSites.map((site: SelectedSite) => site._id),
          device_category: 'lowcost' as const,
        };

        await downloadData(request);
        toast.success(
          'Download Started',
          `Your ${dataTypeToUse} data download has been initiated successfully. The file will be downloaded shortly.`
        );
      } catch (error) {
        console.error('Download failed:', error);
        toast.error(
          'Download Failed',
          'An error occurred while downloading the data. Please try again.'
        );
      }
    },
    [selectedSites, dateRange, dataType, frequency, pollutant, downloadData]
  );

  // Chart data will be handled internally via API calls
  const filteredChartData = useMemo(() => {
    return chartData;
  }, [chartData]);

  // Sidebar content with location cards
  const sidebarContent = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h6 className="font-medium dark:text-gray-100">Select Locations</h6>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {visibleSites.size}/{selectedSites.length} visible
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Bulk Operations */}
      <div className="flex gap-2">
        <button
          onClick={handleSelectAllVisible}
          disabled={visibleSites.size >= MAX_VISIBLE_SITES}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <HiEye className="h-3 w-3" />
          Add All
        </button>
        <button
          onClick={handleDeselectAll}
          disabled={visibleSites.size === 0}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <HiEyeSlash className="h-3 w-3" />
          Hide All
        </button>
      </div>

      <div className="space-y-2">
        {filteredSites.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'No locations found matching your search.'
              : 'No locations selected.'}
          </div>
        ) : (
          filteredSites.map((site: SelectedSite) => (
            <LocationCard
              key={site._id}
              locationName={site.name}
              country={site.country}
              deviceName={site.device_name}
              isChecked={visibleSites.has(site._id)}
              onChange={() => handleSiteVisibilityToggle(site._id)}
              showCloseButton={false}
              onClose={() => handleSiteToggle(site._id)}
              compact
            />
          ))
        )}

        {/* Add Location Card */}
        {activeTab !== 'devices' && (
          <Card
            className={cn(
              'cursor-pointer border-dashed bg-primary/10 border-primary hover:bg-primary/20 transition-colors',
              'dark:bg-primary/5 dark:border-primary dark:hover:bg-primary/10'
            )}
            onClick={handleAddLocation}
          >
            <CardContent className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2 text-primary dark:text-primary">
                <HiPlus className="h-4 w-4" />
                <span className="font-medium text-sm">Add Location</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Filters section
  const filtersContent = (
    <InsightsFilters
      frequency={frequency}
      setFrequency={setFrequency}
      pollutant={pollutant}
      setPollutant={setPollutant}
      chartType={chartType}
      setChartType={setChartType}
      dateRange={dateRange}
      setDateRange={newDateRange => {
        if (newDateRange?.from && newDateRange?.to) {
          setDateRange(newDateRange);
        }
      }}
      dataType={dataType}
      setDataType={setDataType}
      onDownload={handleDownload}
      isDownloading={isDownloading}
    />
  );

  return (
    <WideDialog
      isOpen={isOpen}
      onClose={handleClose}
      headerLeft={
        <div>
          <h2 className="text-xl  dark:text-gray-100">{getHeaderTitle()}</h2>
          {getHeaderSubtitle() && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getHeaderSubtitle()}
            </p>
          )}
        </div>
      }
      sidebar={sidebarContent}
      maxWidth="max-w-6xl"
      showFooter={false}
    >
      <div className="flex flex-col gap-2 h-full">
        {/* Filters */}
        {filtersContent}

        {/* Information Banner */}
        {!isBannerDismissed && selectedSites.length > MAX_VISIBLE_SITES && (
          <InfoBanner
            title="Optimized Data Visualization"
            message={`For optimal chart performance and clarity, we limit simultaneous display to ${MAX_VISIBLE_SITES} locations. Your selection includes ${selectedSites.length} locations, with ${visibleSites.size} currently visible. Use the sidebar controls to manage which locations appear on your analysis.`}
            dismissible
            onDismiss={handleDismissBanner}
          />
        )}

        {/* Chart */}
        <div className="flex-1">
          <ChartContainer
            title={`Air Quality Trends - ${
              POLLUTANT_OPTIONS.find(
                (option: { value: string; label: string }) =>
                  option.value.toLowerCase() === pollutant
              )?.label || pollutant.toUpperCase()
            } ${visibleSites.size >= MAX_VISIBLE_SITES ? '(Max sites reached)' : ''}`}
            loading={isChartLoading}
            className="h-full flex flex-col border"
            showTitle={false}
            showMoreButton={false}
          >
            <DynamicChart
              data={filteredChartData}
              config={{
                type: chartType,
                height: 350,
              }}
              frequency={frequency}
              pollutant={pollutant}
            />
          </ChartContainer>
        </div>
      </div>
    </WideDialog>
  );
};

export default MoreInsights;
