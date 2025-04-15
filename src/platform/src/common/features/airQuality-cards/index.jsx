import React, { useMemo, useCallback, memo } from 'react';
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

/**
 * AQNumberCard displays air quality information.
 */
const AQNumberCard = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();

  // Fetch group and pollutant data from Redux state
  const { loading: isFetchingActiveGroup } = useGetActiveGroup();
  const pollutantType = useSelector((state) => state.chart.pollutionType);

  // Get user preferences and selected sites from Redux state
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  // Get selected site IDs and limit displayed sites to MAX_CARDS
  const selectedSiteIds = useMemo(() => {
    if (!preferences?.selected_sites?.length) return [];
    return preferences.selected_sites.map((site) => site._id);
  }, [preferences]);

  const selectedSites = useMemo(() => {
    if (!preferences?.selected_sites?.length) return [];
    return preferences.selected_sites.slice(0, MAX_CARDS);
  }, [preferences]);

  // Fetch measurements for selected sites
  const { data: measurements, isLoading } = useRecentMeasurements(
    selectedSiteIds.length > 0 ? { site_id: selectedSiteIds.join(',') } : null,
    { revalidateOnFocus: false, revalidateOnMount: true },
  );

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
      if (!measurements) return null;
      return measurements.find((m) => m.site_id === siteId);
    },
    [measurements],
  );

  // Responsive grid classes: adjust columns for different screen sizes.
  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`;

  if (isLoadingData) {
    return (
      <ErrorBoundary name="AQNumberCard" feature="Loading Skeleton">
        <div
          className={gridClasses}
          aria-busy="true"
          aria-label="Loading air quality data"
        >
          {Array.from({ length: MAX_CARDS }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary name="AQNumberCard" feature="Air Quality Card">
      <div className={gridClasses} data-testid="aq-number-card-grid">
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
        {(selectedSites.length < MAX_CARDS || selectedSites.length === 0) && (
          <AddLocationCard onOpenModal={handleOpenModal} />
        )}
      </div>
    </ErrorBoundary>
  );
};

AQNumberCard.propTypes = { className: PropTypes.string };
export default memo(AQNumberCard);
