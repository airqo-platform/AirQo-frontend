import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useRecentMeasurements } from '@/core/hooks/analyticHooks';
import { MAX_CARDS } from './constants';
import { SiteCard, AddLocationCard } from './components';
import { SkeletonCard } from './components/SkeletonCard';

const AQNumberCard = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();
  const { loading: isFetchingActiveGroup } = useGetActiveGroup();

  const pollutantType = useSelector((state) => state.chart.pollutionType);
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  const selectedSiteIds = useMemo(
    () => preferences?.selected_sites?.map((site) => site._id) || [],
    [preferences],
  );

  const selectedSites = useMemo(
    () => preferences?.selected_sites?.slice(0, MAX_CARDS) || [],
    [preferences],
  );

  const { data: measurements, isLoading } = useRecentMeasurements(
    selectedSiteIds.length
      ? {
          site_id: selectedSiteIds.join(','),
        }
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const handleOpenModal = useCallback(
    (type, ids = [], data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );

  if (isLoading || isFetchingActiveGroup) {
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

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {selectedSites.map((site) => (
        <SiteCard
          key={site._id}
          site={site}
          measurement={measurements?.find((m) => m.site_id === site._id)}
          onOpenModal={handleOpenModal}
          windowWidth={windowWidth}
          pollutantType={pollutantType}
        />
      ))}
      {selectedSites.length < MAX_CARDS && (
        <AddLocationCard onOpenModal={handleOpenModal} />
      )}
    </div>
  );
};

AQNumberCard.propTypes = {
  className: PropTypes.string,
};

export default React.memo(AQNumberCard);
