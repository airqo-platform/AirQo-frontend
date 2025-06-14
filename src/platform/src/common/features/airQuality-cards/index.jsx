import React, { useMemo, useCallback, memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useRecentMeasurements } from '@/core/hooks/analyticHooks';
import { MAX_CARDS } from './constants';
import { SiteCard, AddLocationCard } from './components';
import { SkeletonCard } from './components/SkeletonCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import Toast from '@/components/Toast';
import { useOrganizationLoading } from '@/app/providers/OrganizationLoadingProvider';

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The id to validate
 * @returns {boolean} - Whether the id is valid
 */
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * AQNumberCard displays air quality information for selected monitoring sites.
 */
const AQNumberCard = () => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();
  const [error, setError] = useState(null);
  const { isOrganizationLoading } = useOrganizationLoading();

  // Fetch group and pollutant data from Redux state
  const { loading: isFetchingActiveGroup } = useGetActiveGroup();
  const pollutantType = useSelector((state) => state.chart.pollutionType);

  // Get user preferences and selected sites from Redux state
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  // Get chart sites from Redux (used for organizations)
  const chartSites = useSelector((state) => state.chart.chartSites);

  // Get selected site IDs and validate them before using
  const selectedSiteIds = useMemo(() => {
    // For individual users, use their preferences
    if (preferences?.selected_sites?.length) {
      return preferences.selected_sites
        .map((site) => site._id)
        .filter(isValidObjectId);
    }

    // For organizations or when no user preferences, use chart sites
    if (chartSites?.length) {
      return chartSites.filter(isValidObjectId);
    }

    return [];
  }, [preferences, chartSites]);

  // Improved fetch logic to handle view transitions
  const shouldFetch = useMemo(() => {
    // Don't fetch if no site IDs
    if (selectedSiteIds.length === 0) return false;

    // For user view with preferences - always fetch
    if (preferences?.selected_sites?.length) return true;

    // For organization view - only fetch if not switching organizations and we have chart sites
    if (chartSites?.length && !isOrganizationLoading) return true;

    return false;
  }, [selectedSiteIds, preferences, chartSites, isOrganizationLoading]);

  const {
    data: measurements,
    isLoading,
    error: measurementsError,
  } = useRecentMeasurements(
    shouldFetch ? { site_id: selectedSiteIds.join(',') } : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnVisibilityChange: false,
      revalidateOnMount: true,
      // Force refetch when switching between views
      dedupingInterval: isOrganizationLoading ? 0 : 30000,
      onError: (_err) => {
        setError('Failed to fetch air quality data. Please try again later.');
      },
    },
  );

  const selectedSites = useMemo(() => {
    // For individual users, use their preferences directly
    if (preferences?.selected_sites?.length) {
      return preferences.selected_sites
        .filter((site) => isValidObjectId(site._id))
        .slice(0, MAX_CARDS);
    }

    // For organizations, create site objects from measurements data
    if (chartSites?.length && measurements?.length) {
      return chartSites
        .map((siteId) => {
          const measurement = measurements.find((m) => m.site_id === siteId);
          if (measurement) {
            // Extract proper location name from various possible sources
            const extractLocationName = (measurement) => {
              // Try to get name from site details in measurement
              if (
                measurement.site?.name &&
                measurement.site.name !== measurement.site_id
              ) {
                return measurement.site.name;
              }

              // Try to get from siteDetails (common in recent measurements)
              if (
                measurement.siteDetails?.name &&
                measurement.siteDetails.name !== measurement.site_id
              ) {
                return measurement.siteDetails.name;
              }

              // Try search_name or location_name
              if (measurement.siteDetails?.search_name) {
                return measurement.siteDetails.search_name;
              }

              if (measurement.siteDetails?.location_name) {
                return measurement.siteDetails.location_name;
              }

              // Try formatted name
              if (measurement.siteDetails?.formatted_name) {
                return measurement.siteDetails.formatted_name;
              }

              // Fallback to abbreviated site_id
              return measurement.site_id?.substring(0, 8)
                ? `Site ${measurement.site_id.substring(0, 8)}...`
                : 'Unknown Location';
            };

            // Extract country information
            const extractCountry = (measurement) => {
              if (measurement.site?.country) return measurement.site.country;
              if (measurement.siteDetails?.country)
                return measurement.siteDetails.country;
              if (measurement.siteDetails?.city)
                return measurement.siteDetails.city;
              if (measurement.siteDetails?.region)
                return measurement.siteDetails.region;
              return 'Unknown Location';
            };

            return {
              _id: siteId,
              name: extractLocationName(measurement),
              country: extractCountry(measurement),
              location:
                measurement.site?.location ||
                measurement.siteDetails?.location ||
                {},
              // Include additional site properties
              search_name: measurement.siteDetails?.search_name,
              city: measurement.siteDetails?.city,
              region: measurement.siteDetails?.region,
              ...measurement.site,
            };
          }
          return null;
        })
        .filter(Boolean)
        .slice(0, MAX_CARDS);
    }

    return [];
  }, [preferences, chartSites, measurements]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error || measurementsError) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, measurementsError]);

  // Force refresh when switching between organization and user contexts
  useEffect(() => {
    // If we were loading organizations and now we're not, but we have no data
    if (
      !isOrganizationLoading &&
      selectedSiteIds.length > 0 &&
      (!measurements || measurements.length === 0) &&
      shouldFetch
    ) {
      // Add a small delay to ensure the context has fully switched
      const refreshTimeout = setTimeout(() => {
        // Force a re-render by updating a state if needed
        if (selectedSites.length === 0 && selectedSiteIds.length > 0) {
          setError(null); // This triggers a re-render
        }
      }, 100);
      return () => clearTimeout(refreshTimeout);
    }
  }, [
    isOrganizationLoading,
    selectedSiteIds.length,
    measurements,
    shouldFetch,
    selectedSites.length,
  ]);

  // Handler to open modals for card actions
  const handleOpenModal = useCallback(
    (type, ids = [], data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );
  const isLoadingData = useMemo(() => {
    // Show loading only when actively fetching or transitioning
    if (isFetchingActiveGroup) return true;

    // During organization loading, show loading state
    if (isOrganizationLoading) return true;

    // Show loading when we expect data but don't have it yet
    if (isLoading && shouldFetch) return true;

    // If we have site IDs but no selected sites or measurements, show loading
    if (
      selectedSiteIds.length > 0 &&
      selectedSites.length === 0 &&
      !measurements
    ) {
      return true;
    }

    return false;
  }, [
    isLoading,
    isFetchingActiveGroup,
    isOrganizationLoading,
    shouldFetch,
    selectedSiteIds.length,
    selectedSites.length,
    measurements,
  ]);

  const getMeasurementForSite = useCallback(
    (siteId) => {
      if (!measurements || !isValidObjectId(siteId)) return null;
      return measurements.find((m) => m.site_id === siteId);
    },
    [measurements],
  );

  // Responsive grid classes: adjust columns for different screen sizes.
  const gridClasses =
    'w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4';

  return (
    <ErrorBoundary name="AQNumberCard" feature="Air Quality Card">
      {error && (
        <Toast
          message={error}
          clearData={() => setError(null)}
          type="error"
          timeout={5000}
          position="top"
        />
      )}

      <div
        className={gridClasses}
        aria-busy={isLoadingData ? 'true' : 'false'}
        aria-label="Air quality data grid"
        data-testid="aq-number-card-grid"
      >
        {isLoadingData ? (
          // Show skeleton cards while loading
          Array.from({ length: MAX_CARDS }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))
        ) : (
          // Show actual site cards once data is loaded
          <>
            {selectedSites.map((site) => (
              <SiteCard
                key={site._id}
                site={site}
                measurement={getMeasurementForSite(site._id)}
                onOpenModal={handleOpenModal}
                windowWidth={windowWidth}
                pollutantType={pollutantType}
              />
            ))}
            {(selectedSites.length < MAX_CARDS ||
              selectedSites.length === 0) && (
              <AddLocationCard onOpenModal={handleOpenModal} />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

AQNumberCard.propTypes = { className: PropTypes.string };
export default memo(AQNumberCard);
