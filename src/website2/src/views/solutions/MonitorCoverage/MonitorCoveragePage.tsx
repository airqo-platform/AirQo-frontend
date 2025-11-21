'use client';

import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiMapPin, FiActivity, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineStatusOnline, HiOutlineStatusOffline } from 'react-icons/hi';

import { MapContainer, MapLoader } from '@/components/map';
import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton, Divider } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import externalService from '@/services/apiService/external';
import { Grid, GridsSummaryResponse, Site, SiteStatistics } from '@/types';

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

const MonitorCoveragePage = () => {
  const [gridsData, setGridsData] = useState<Grid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<Grid | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch grids data with pagination
  const fetchGridsData = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await externalService.getGridsSummary({
          limit: 30,
          page: page,
          tenant: 'airqo',
          detailLevel: 'summary',
        });

        if (response && response.grids) {
          setGridsData(response.grids);
          setTotalPages(response.meta?.totalPages || 1);
          setCurrentPage(page);

          // Auto-select first grid if none selected
          if (!selectedGrid && response.grids.length > 0) {
            setSelectedGrid(response.grids[0]);
          }
        } else {
          setError('No data available');
        }
      } catch (err) {
        console.error('Error fetching grids data:', err);
        setError(
          'Failed to load monitor coverage data. Please try again later.',
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedGrid],
  );

  useEffect(() => {
    fetchGridsData(1);
  }, []);

  // Calculate statistics
  const statistics = useMemo<SiteStatistics>(() => {
    const allSites = gridsData.flatMap((grid) => grid.sites || []);
    const onlineSites = allSites.filter(
      (site) => site.isOnline || site.rawOnlineStatus,
    );
    const uniqueCountries = Array.from(
      new Set(allSites.map((site) => site.country).filter(Boolean)),
    );
    const uniqueCities = Array.from(
      new Set(allSites.map((site) => site.city).filter(Boolean)),
    );

    return {
      totalSites: allSites.length,
      onlineSites: onlineSites.length,
      offlineSites: allSites.length - onlineSites.length,
      countries: uniqueCountries as string[],
      cities: uniqueCities as string[],
    };
  }, [gridsData]);

  // Get sites for the map
  const mapSites = useMemo(() => {
    if (selectedGrid) {
      return selectedGrid.sites || [];
    }
    return gridsData.flatMap((grid) => grid.sites || []);
  }, [selectedGrid, gridsData]);

  // Filter grids based on search
  const filteredGrids = useMemo(() => {
    if (!searchQuery.trim()) return gridsData;
    const query = searchQuery.toLowerCase();
    return gridsData.filter(
      (grid) =>
        grid.name.toLowerCase().includes(query) ||
        grid.long_name.toLowerCase().includes(query) ||
        grid.sites.some(
          (site) =>
            site.city?.toLowerCase().includes(query) ||
            site.country?.toLowerCase().includes(query) ||
            site.name?.toLowerCase().includes(query),
        ),
    );
  }, [gridsData, searchQuery]);

  const handleGridSelect = (grid: Grid) => {
    setSelectedGrid(grid);
    setSelectedSite(null);
  };

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site);
  };

  const handleViewAllSites = () => {
    setSelectedGrid(null);
    setSelectedSite(null);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Monitors
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? '...' : statistics.totalSites}
                </p>
              </div>
              <FiMapPin className="w-10 h-10 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Online Monitors
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? '...' : statistics.onlineSites}
                </p>
              </div>
              <HiOutlineStatusOnline className="w-10 h-10 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Countries</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? '...' : statistics.countries.length}
                </p>
              </div>
              <FiGlobe className="w-10 h-10 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cities</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? '...' : statistics.cities.length}
                </p>
              </div>
              <FiActivity className="w-10 h-10 text-orange-500" />
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Grid Selection */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedGrid && (
                  <button
                    onClick={handleViewAllSites}
                    className="w-full mb-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    View All Locations
                  </button>
                )}

                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2 text-sm">
                        Loading locations...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  ) : filteredGrids.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 text-sm">
                        No locations found
                      </p>
                    </div>
                  ) : (
                    filteredGrids.map((grid) => (
                      <button
                        key={grid._id}
                        onClick={() => handleGridSelect(grid)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedGrid?._id === grid._id
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <h3 className="font-semibold text-sm text-gray-900">
                          {grid.long_name || grid.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {grid.numberOfSites} monitor
                          {grid.numberOfSites !== 1 ? 's' : ''} •{' '}
                          {grid.admin_level}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-600">
                              {
                                grid.sites.filter(
                                  (s) => s.isOnline || s.rawOnlineStatus,
                                ).length
                              }{' '}
                              online
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <button
                      onClick={() => fetchGridsData(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchGridsData(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Site Details */}
              {selectedSite && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Monitor Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">
                        {selectedSite.name || selectedSite.formatted_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">City:</span>
                      <p className="font-medium">
                        {selectedSite.city || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Country:</span>
                      <p className="font-medium">
                        {selectedSite.country || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p
                        className={`font-medium ${
                          selectedSite.isOnline || selectedSite.rawOnlineStatus
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {selectedSite.isOnline || selectedSite.rawOnlineStatus
                          ? '● Online'
                          : '○ Offline'}
                      </p>
                    </div>
                    {selectedSite.lastRawData && (
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <p className="font-medium text-xs">
                          {new Date(selectedSite.lastRawData).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Coordinates:</span>
                      <p className="font-medium text-xs">
                        {selectedSite.approximate_latitude.toFixed(6)},{' '}
                        {selectedSite.approximate_longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <MapLoader>
                  <MapContainer
                    sites={mapSites}
                    selectedSiteId={selectedSite?._id}
                    onSiteClick={handleSiteClick}
                    className="h-[700px]"
                  />
                </MapLoader>
              </div>

              {selectedGrid && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Viewing: {selectedGrid.long_name || selectedGrid.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Showing {selectedGrid.numberOfSites} monitoring stations in
                    this region. Click on markers to view details or select
                    another location from the list.
                  </p>
                </div>
              )}
            </div>
          </div>
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
                AirQo operates one of Africa's largest air quality monitoring
                networks with over 200 monitors deployed across 16+ countries.
                Our network provides real-time air quality data to millions of
                people, helping communities, researchers, and policymakers make
                informed decisions about air quality.
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
                coverage and more granular air quality data. If you're
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
