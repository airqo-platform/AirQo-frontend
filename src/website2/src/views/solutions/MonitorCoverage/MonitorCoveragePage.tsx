'use client';

import { AqGlobe02, AqMarkerPin01, AqMonitor03 } from '@airqo/icons-react';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

import { MapContainer, MapLoader } from '@/components/map';
import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton, Divider } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useGridsSummaryV2 } from '@/hooks';
import { Grid, Site, SiteStatistics } from '@/types';

// Utility function to format text
const formatText = (text: string): string => {
  return text
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Define motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const GridSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, index) => (
      <div
        key={index}
        className="w-full p-3 rounded-md border border-gray-200 bg-gray-50 animate-pulse"
      >
        <div className="h-4 bg-gray-300 rounded mb-1 w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const MonitorCoveragePage = () => {
  const [selectedGrid, setSelectedGrid] = useState<Grid | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [allGrids, setAllGrids] = useState<Grid[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if the debounced value is different
      if (searchQuery !== debouncedSearch) {
        setDebouncedSearch(searchQuery);
        setCurrentSkip(0); // Reset pagination when search changes
        setAllGrids([]); // Clear accumulated data
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch grids data using the new v2 hook
  const { data, error, isLoading } = useGridsSummaryV2({
    limit: 80,
    skip: currentSkip,
    admin_level: 'country',
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  // Accumulate grids data for pagination
  useEffect(() => {
    if (data?.grids) {
      if (currentSkip === 0) {
        // Replace data on first load or after search
        setAllGrids(data.grids);
        // Auto-select first grid if none selected and not searching
        if (!selectedGrid && data.grids.length > 0 && !debouncedSearch) {
          setSelectedGrid(data.grids[0]);
        }
      } else {
        // Append data when loading more
        setAllGrids((prev) => [...prev, ...data.grids]);
      }
    }
  }, [data, currentSkip, debouncedSearch, selectedGrid]);

  // Calculate if there's more data to load
  const hasMoreData = useMemo(() => {
    if (!data?.meta) return false;
    const { total, skip, limit } = data.meta;
    return skip + limit < total;
  }, [data]);

  // Load more data function
  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !isLoading) {
      setCurrentSkip((prev) => prev + 80);
    }
  }, [hasMoreData, isLoading]);

  // Calculate statistics
  const statistics = useMemo<SiteStatistics>(() => {
    const allSites = allGrids.flatMap((grid) => grid.sites || []);
    const onlineSites = allSites.filter(
      (site) => site.isOnline || site.rawOnlineStatus,
    );
    const uniqueCountries = Array.from(
      new Set(allSites.map((site) => site.country).filter(Boolean)),
    );

    return {
      totalSites: allSites.length,
      onlineSites: onlineSites.length,
      offlineSites: allSites.length - onlineSites.length,
      countries: uniqueCountries as string[],
    };
  }, [allGrids]);

  // Get sites for the map
  const mapSites = useMemo(() => {
    if (selectedGrid) {
      return selectedGrid.sites || [];
    }
    return allGrids.flatMap((grid) => grid.sites || []);
  }, [selectedGrid, allGrids]);

  const handleGridSelect = useCallback((grid: Grid) => {
    setSelectedGrid(grid);
    setSelectedSite(null);
  }, []);

  const handleSiteClick = useCallback((site: Site) => {
    setSelectedSite(site);
  }, []);

  const handleViewAllSites = useCallback(() => {
    setSelectedGrid(null);
    setSelectedSite(null);
  }, []);

  return (
    <div className="pb-16 flex flex-col w-full space-y-20">
      {/* Hero Section */}
      <HeroSection
        bgColor="bg-blue-50"
        breadcrumbText="Solutions > Monitor Coverage"
        title="Monitor Coverage Network"
        description="Explore our extensive air quality monitoring network across Africa. Discover where we measure air pollution and track real-time data from hundreds of monitoring stations."
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* Statistics Section */}
      <motion.section
        className={`${mainConfig.containerClass} px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-white rounded-md shadow-md p-6 border border-gray-200"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Monitors
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading && currentSkip === 0
                    ? '...'
                    : `${statistics.totalSites}+`}
                </p>
              </div>
              <AqMonitor03 className="w-10 h-10 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-md shadow-md p-6 border border-gray-200"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Countries</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading && currentSkip === 0
                    ? '...'
                    : statistics.countries.length}
                </p>
              </div>
              <AqGlobe02 className="w-10 h-10 text-purple-500" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Divider />

      {/* Map and Filters Section */}
      <motion.section
        className={`${mainConfig.containerClass} px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-semibold mb-6">Coverage Map</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sidebar - Grid Selection */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 h-[400px] flex flex-col">
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search locations in Africa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {selectedGrid && (
                  <button
                    onClick={handleViewAllSites}
                    className="w-full mb-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                  >
                    View All Locations
                  </button>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                  {isLoading && currentSkip === 0 ? (
                    <GridSkeleton />
                  ) : error ? (
                    <div className="text-center py-8">
                      <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 text-sm">
                        Failed to load data. Please try again.
                      </p>
                    </div>
                  ) : allGrids.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 text-sm">
                        No locations found
                      </p>
                    </div>
                  ) : (
                    <>
                      {allGrids.map((grid) => (
                        <button
                          key={grid._id}
                          onClick={() => handleGridSelect(grid)}
                          className={`w-full text-left p-3 rounded-md transition-all border flex items-start gap-3 ${
                            selectedGrid?._id === grid._id
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <AqMarkerPin01
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              selectedGrid?._id === grid._id
                                ? 'text-blue-600'
                                : 'text-gray-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 leading-tight capitalize">
                              {formatText(grid.long_name || grid.name)}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {grid.numberOfSites} monitor
                              {grid.numberOfSites !== 1 ? 's' : ''} •{' '}
                              <span className="capitalize">
                                {formatText(grid.admin_level)}
                              </span>
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Load More Button - Always visible at bottom */}
                {hasMoreData && !error && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 transition-colors"
                    >
                      {isLoading ? 'Loading...' : 'Load More Locations'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Map Container */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <MapLoader>
                  <MapContainer
                    sites={mapSites}
                    selectedSiteId={selectedSite?._id}
                    onSiteClick={handleSiteClick}
                    isAllSites={!selectedGrid}
                    className="h-[400px]"
                  />
                </MapLoader>
              </div>
            </div>
          </div>

          {/* Selected Site Details Banner */}
          {selectedSite && (
            <div className="mt-6 bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {selectedSite.name || selectedSite.formatted_name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">City:</span>
                      <p className="text-gray-900">
                        {selectedSite.city || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">
                        Country:
                      </span>
                      <p className="text-gray-900">
                        {selectedSite.country || 'N/A'}
                      </p>
                    </div>
                    {selectedSite.lastRawData && (
                      <div>
                        <span className="text-gray-500 font-medium">
                          Last Updated:
                        </span>
                        <p className="text-gray-900 text-xs">
                          {new Date(selectedSite.lastRawData).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 font-medium">
                        Coordinates:
                      </span>
                      <p className="text-gray-900 text-xs font-mono">
                        {selectedSite.approximate_latitude.toFixed(6)},{' '}
                        {selectedSite.approximate_longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedGrid && (
            <div className="mt-4 bg-blue-50 rounded-md p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Viewing: {selectedGrid.long_name || selectedGrid.name}
              </h4>
              <p className="text-sm text-gray-600">
                Showing {selectedGrid.numberOfSites} monitoring stations in this
                region. Click on markers to view details or select another
                location from the list.
              </p>
            </div>
          )}
        </motion.div>
      </motion.section>

      <Divider />

      {/* Coverage Information */}
      <motion.section
        className={`${mainConfig.containerClass} px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-semibold mb-6">About Our Network</h2>
          <div className="bg-gray-100 rounded-lg p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">
                Extensive Coverage Across Africa
              </h3>
              <p className="text-gray-700">
                AirQo operates one of Africa&apos;s largest air quality
                monitoring networks with over 300+ monitors deployed across 16+
                countries. Our network provides real-time air quality data to
                millions of people, helping communities, researchers, and
                policymakers make informed decisions about air quality.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                Real-Time Monitoring
              </h3>
              <p className="text-gray-700">
                Each monitor in our network measures key air quality parameters
                including PM2.5, PM10, and NO2. Data is transmitted in
                real-time, providing up-to-date information about air quality
                conditions across the region.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Expanding Coverage</h3>
              <p className="text-gray-700">
                We continuously work to expand our network to provide better
                coverage and more granular air quality data. If you&apos;re
                interested in hosting a monitor or partnering with us to expand
                coverage in your area, please get in touch.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <CustomButton
              onClick={() => (window.location.href = '/contact')}
              className="bg-blue-600 text-white px-8 py-3 hover:bg-blue-700"
            >
              Partner With Us →
            </CustomButton>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default MonitorCoveragePage;
