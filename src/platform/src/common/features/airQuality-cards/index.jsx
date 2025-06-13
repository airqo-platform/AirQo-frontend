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

  // Only fetch measurements if we have valid site IDs
  const {
    data: measurements,
    isLoading,
    error: measurementsError,
  } = useRecentMeasurements(
    selectedSiteIds.length > 0 ? { site_id: selectedSiteIds.join(',') } : null,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      // Don't retry on 400 errors
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
            return {
              _id: siteId,
              name: measurement.site?.name || measurement.site_id,
              location: measurement.site?.location || {},
              // Add other site properties from measurement if available
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

  // Handler to open modals for card actions
  const handleOpenModal = useCallback(
    (type, ids = [], data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );

  const isLoadingData = isLoading || isFetchingActiveGroup;

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
