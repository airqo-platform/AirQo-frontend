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

/**
 * AQNumberCard component displays air quality information in card format
 * for selected sites, with ability to add new locations
 */
const AQNumberCard = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();

  // Fetch data states
  const { loading: isFetchingActiveGroup } = useGetActiveGroup();
  const pollutantType = useSelector((state) => state.chart.pollutionType);

  // Get user preferences and selected sites
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  // Extract and limit the number of site IDs
  const selectedSiteIds = useMemo(() => {
    if (!preferences?.selected_sites?.length) return [];
    return preferences.selected_sites.map((site) => site._id);
  }, [preferences]);

  // Limit displayed sites to MAX_CARDS
  const selectedSites = useMemo(() => {
    if (!preferences?.selected_sites?.length) return [];
    return preferences.selected_sites.slice(0, MAX_CARDS);
  }, [preferences]);

  // Fetch measurements for selected sites
  const { data: measurements, isLoading } = useRecentMeasurements(
    selectedSiteIds.length > 0 ? { site_id: selectedSiteIds.join(',') } : null,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  // Handler for opening modals
  const handleOpenModal = useCallback(
    (type, ids = [], data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );

  // Loading state
  const isLoadingData = isLoading || isFetchingActiveGroup;

  // Find measurement data for a specific site
  const getMeasurementForSite = useCallback(
    (siteId) => {
      if (!measurements) return null;
      return measurements.find((m) => m.site_id === siteId);
    },
    [measurements],
  );

  // Render loading skeleton
  if (isLoadingData) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      >
        {Array.from({ length: MAX_CARDS }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Render cards grid
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      data-testid="aq-number-card-grid"
    >
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

      {/* Show "Add Location" card if there's room for more sites */}
      {selectedSites.length < MAX_CARDS && (
        <AddLocationCard onOpenModal={handleOpenModal} />
      )}
    </div>
  );
};

AQNumberCard.propTypes = {
  className: PropTypes.string,
};

export default memo(AQNumberCard);
